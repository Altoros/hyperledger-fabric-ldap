.PHONY: bootstrap
.PHONY: generate artifacts build-client build-ldap up ss-certs
.PHONY: clean force-clean

FS_PATH = ./
FN_PATH = $(FS_PATH)/fabric-samples/first-network

VERSION = 1.4.4
CA_VERSION = 1.4.4
THIRDPARTY_IMAGE_VERSION = 0.4.18

# solo, kafka or etcdraft
CONSENSUS = solo
VERBOSE = true
CERTIFICATE_AUTHORITIES = true
CHANNEL_NAME = common
CHAINCODE_NAME = ldap_demo
IF_COUCHDB = nocouchdb
NO_CHAINCODE = true

LDAP = true
APP = true


UP_NETWORK_OPTIONS = up -o $(CONSENSUS) -c $(CHANNEL_NAME) -s $(IF_COUCHDB)
EXTERNAL_SERVICES =
ifeq ($(VERBOSE), true)
	UP_NETWORK_OPTIONS += -v
endif
ifeq ($(CERTIFICATE_AUTHORITIES), true)
	UP_NETWORK_OPTIONS += -a
endif
ifeq ($(NO_CHAINCODE), true)
	UP_NETWORK_OPTIONS += -n
endif

ifeq ($(LDAP), true)
	EXTERNAL_SERVICES += \
	-f ../../fabric-ca-server/docker-compose-ca.yaml \
	-f ../../openldap/docker-compose-ldap.yaml
endif
ifeq ($(APP), true)
	EXTERNAL_SERVICES += \
	-f ../../app/docker-compose-app.yaml
endif

UP_NETWORK_OPTIONS += -f \
	"docker-compose-cli.yaml \
	$(EXTERNAL_SERVICES)"

SAMPLES = true
BINARIES = true
DOCKER = false

BOOTSTRAP_OPTIONS = $(VERSION) $(CA_VERSION) $(THIRDPARTY_IMAGE_VERSION)

ifeq ($(SAMPLES), false)
	BOOTSTRAP_OPTIONS += -s
endif
ifeq ($(BINARIES), false)
	BOOTSTRAP_OPTIONS += -b
endif
ifeq ($(DOCKER), false)
	BOOTSTRAP_OPTIONS += -d
endif
help:
	@echo "LDAP Integration Simple Demo"
	@echo ""
	@echo "generate: generate artifacts with crypto material, configs and docker-compose templates"
	@echo "          build API and web client"
	@echo "up: bring up the network"
	@echo "clean: remove docker containers and volumes"
	@echo "build-client: build web client (building occurs inside docker container, no Node dependency)"
	@echo ""

generate: artifacts build-ldap build-client

bootstrap:
	curl -sS https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh -o ./bootstrap.sh && \
	chmod +x ./bootstrap.sh && \
	./bootstrap.sh $(BOOTSTRAP_OPTIONS)

artifacts: ss-certs
	cd $(FN_PATH) && \
	./byfn.sh generate -c $(CHANNEL_NAME)

up:
	cd $(FN_PATH) && \
	./byfn.sh $(UP_NETWORK_OPTIONS) && \
	docker rename ca_peerOrg1 ca.org1.example.com && \
    docker rename ca_peerOrg2 ca.org2.example.com

clean:
	rm -rf ss-certs && \
	rm -rf wallets && \
	cd $(FN_PATH) && ./byfn.sh down

force-clean:
	docker ps -qa | xargs docker stop # \
	docker ps -qa | xargs docker rm # \
	docker volume rm $$(docker volume ls -q) -f # \
	docker network prune # \
	rm -rf fabric-samples # \
	rm bootstrap.sh # \
	rm -rf ss-certs # \
	rm -rf wallets


build-client:
	./scripts/build-client.sh

build-ldap:
	./scripts/build-ldap.sh

restart-app:
	docker restart app.org1.example.com app.org2.example.com

ss-certs:
	./scripts/gen-ss-certs.sh
