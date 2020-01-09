#!/usr/bin/env bash

: ${DOMAIN:="example.com"}
: ${LDAP:="ldap"}
: ${APP:="app"}
: ${CA:="ca"}

: ${ORGS:=org1 org2}

: ${SS_DIR:="./ss-certs"}

mkdir -p $SS_DIR/

for ORG in ${ORGS[@]}; do
    echo "### Make folder ###"
    mkdir -p $SS_DIR/$ORG

    echo "### Make CA ###"

    echo "### RSA key for CA ###"
    openssl genrsa -out $SS_DIR/$ORG/$CA.$ORG.$DOMAIN.key 2048

    echo "### Certificate for CA ###"
    openssl req -x509 -new -subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=$CA.$ORG.$DOMAIN" -key $SS_DIR/$ORG/$CA.$ORG.$DOMAIN.key -days 10000 -out $SS_DIR/$ORG/$CA.$ORG.$DOMAIN.crt


    echo "### Generate a 2048 bit RSA key ###"

    echo "### RSA key for ldap ###"
    openssl genrsa -out $SS_DIR/$ORG/$LDAP.$ORG.$DOMAIN.key 2048

    echo "### RSA key for app ###"
    openssl genrsa -out $SS_DIR/$ORG/$APP.$ORG.$DOMAIN.key 2048

    echo "### Generate a certificate signing request (.csr) using openssl ###"

    echo "### CSR for ldap ###"
    openssl req -subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=$LDAP.$ORG.$DOMAIN" -new -sha256 -key $SS_DIR/$ORG/$LDAP.$ORG.$DOMAIN.key -out $SS_DIR/$ORG/$LDAP.$ORG.$DOMAIN.csr

    echo "### CSR for app ###"
    openssl req -subj "/C=GB/ST=London/L=London/O=Global Security/OU=IT Department/CN=$APP.$ORG.$DOMAIN" -new -sha256 -key $SS_DIR/$ORG/$APP.$ORG.$DOMAIN.key -out $SS_DIR/$ORG/$APP.$ORG.$DOMAIN.csr

    echo "### Sign CRT ###"

    echo "### Sign CRT for ldap ###"
    openssl x509 -req -in $SS_DIR/$ORG/$LDAP.$ORG.$DOMAIN.csr -CA $SS_DIR/$ORG/$CA.$ORG.$DOMAIN.crt -CAkey $SS_DIR/$ORG/$CA.$ORG.$DOMAIN.key -CAcreateserial -out $SS_DIR/$ORG/$LDAP.$ORG.$DOMAIN.crt -days 5000
    echo "### Sign CRT for app ###"
    openssl x509 -req -in $SS_DIR/$ORG/$APP.$ORG.$DOMAIN.csr -CA $SS_DIR/$ORG/$CA.$ORG.$DOMAIN.crt -CAkey $SS_DIR/$ORG/$CA.$ORG.$DOMAIN.key -CAcreateserial -out $SS_DIR/$ORG/$APP.$ORG.$DOMAIN.crt -days 5000

done
