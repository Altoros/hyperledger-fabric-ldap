#!/bin/bash -e
set -o pipefail

# set -x (bash debug) if log level is trace
# https://github.com/osixia/docker-light-baseimage/blob/stable/image/tool/log-helper
log-helper level eq trace && set -x


    file_env() {
        local var="$1"
        local fileVar="${var}_FILE"

      # The variables are already defined from the docker-light-baseimage
      # So if the _FILE variable is available we ovewrite them
        if [ "${!fileVar:-}" ]; then
        log-helper trace "${fileVar} was defined"

            val="$(< "${!fileVar}")"
        log-helper debug "${var} was repalced with the contents of ${fileVar} (the value was: ${val})"

        export "$var"="$val"
        fi

        unset "$fileVar"
    }


    file_env 'LDAP_ADMIN_PASSWORD'
    file_env 'LDAP_CONFIG_PASSWORD'
    file_env 'LDAP_READONLY_USER_PASSWORD'

    function get_ldap_base_dn() {
    # if LDAP_BASE_DN is empty set value from LDAP_DOMAIN
    if [ -z "$LDAP_BASE_DN" ]; then
      IFS='.' read -ra LDAP_BASE_DN_TABLE <<< "$LDAP_DOMAIN"
      for i in "${LDAP_BASE_DN_TABLE[@]}"; do
        EXT="dc=$i,"
        LDAP_BASE_DN=$LDAP_BASE_DN$EXT
      done

      LDAP_BASE_DN=${LDAP_BASE_DN::-1}
    fi
    # Check that LDAP_BASE_DN and LDAP_DOMAIN are in sync
    domain_from_base_dn=$(echo $LDAP_BASE_DN | tr ',' '\n' | sed -e 's/^.*=//' | tr '\n' '.' | sed -e 's/\.$//')
    set +e
    echo "$domain_from_base_dn" | egrep -q ".*$LDAP_DOMAIN\$"
    if [ $? -ne 0 ]; then
      log-helper error "Error: domain $domain_from_base_dn derived from LDAP_BASE_DN $LDAP_BASE_DN does not match LDAP_DOMAIN $LDAP_DOMAIN"
      exit 1
    fi
    set -e
    }

    function ldap_add_or_modify (){
    local LDIF_FILE=$1

    log-helper debug "Processing file ${LDIF_FILE}"
    sed -i "s|{{ LDAP_BASE_DN }}|${LDAP_BASE_DN}|g" $LDIF_FILE
    sed -i "s|{{ LDAP_BACKEND }}|${LDAP_BACKEND}|g" $LDIF_FILE
    sed -i "s|{{ LDAP_DOMAIN }}|${LDAP_DOMAIN}|g" $LDIF_FILE
    sed -i "s|{{ ORG_NAME }}|${ORG_NAME}|g" $LDIF_FILE
    sed -i "s|{{ DOMAIN_NAME }}|${DOMAIN_NAME}|g" $LDIF_FILE
    sed -i "s|{{ DOMAIN_ZONE }}|${DOMAIN_ZONE}|g" $LDIF_FILE
    if [ "${LDAP_READONLY_USER,,}" == "true" ]; then
      sed -i "s|{{ LDAP_READONLY_USER_USERNAME }}|${LDAP_READONLY_USER_USERNAME}|g" $LDIF_FILE
      sed -i "s|{{ LDAP_READONLY_USER_PASSWORD_ENCRYPTED }}|${LDAP_READONLY_USER_PASSWORD_ENCRYPTED}|g" $LDIF_FILE
    fi
    if grep -iq changetype $LDIF_FILE ; then
        ( ldapmodify -Y EXTERNAL -Q -H ldapi:/// -f $LDIF_FILE 2>&1 || ldapmodify -xZZWD -D cn=admin,$LDAP_BASE_DN -w "$LDAP_ADMIN_PASSWORD" -f $LDIF_FILE 2>&1 ) | log-helper debug
    else
        ( ldapadd -Y EXTERNAL -Q -H ldapi:/// -f $LDIF_FILE 2>&1 || ldapadd -xZZWD -D cn=admin,$LDAP_BASE_DN -w "$LDAP_ADMIN_PASSWORD" -f $LDIF_FILE 2>&1 ) | log-helper debug
    fi
    }

    get_ldap_base_dn
    log-helper info "Add custom bootstrap ldif..."
    for f in $(find /container/service/slapd/assets/config/bootstrap/ldif/add-modify -type f -name \*.ldif  | sort); do
        ldap_add_or_modify "$f"
    done

exit 0
