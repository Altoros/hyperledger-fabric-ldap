.PHONY: bootstrap
.PHONY: generate artifacts build-client build-ldap up
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
LDAP = true
APP = true


UP_NETWORK_OPTIONS = up -o $(CONSENSUS) -c $(CHANNEL_NAME) -s $(IF_COUCHDB)
ifeq ($(VERBOSE), true)
	UP_NETWORK_OPTIONS += -v
endif
ifeq ($(CERTIFICATE_AUTHORITIES), true)
	UP_NETWORK_OPTIONS += -a
endif
ifeq ($(LDAP), true)
	UP_NETWORK_OPTIONS += -f \
	"docker-compose-cli.yaml \
	-f ../../fabric-ca-server/docker-compose-ca.yaml \
	-f ../../openldap/docker-compose-ldap.yaml"
endif

ifeq ($(APP), true)
	UP_NETWORK_OPTIONS += -f ../../app/docker-compose-app.yaml"
endif

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

artifacts:
	cd $(FN_PATH) && \
	./byfn.sh generate -c $(CHANNEL_NAME)

up:
	cd $(FN_PATH) && \
	./byfn.sh $(UP_NETWORK_OPTIONS)

up-ldap:
	docker-compose -f openldap/docker-compose-ldap.yaml up -d

up-ca:
	export BYFN_CA1_PRIVATE_KEY=$$(cd $(FN_PATH)/crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk) && \
    export BYFN_CA2_PRIVATE_KEY=$$(cd $(FN_PATH)/crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk) && \
    export IMAGE_TAG=$(IMAGE_TAG) && \
	docker-compose -f fabric-ca-server/docker-compose-ca.yaml up -d

down-ldap:
	docker-compose -f openldap/docker-compose-ldap.yaml down

down-ca:
	export BYFN_CA1_PRIVATE_KEY=$$(cd $(FN_PATH)/crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk) && \
	export BYFN_CA2_PRIVATE_KEY=$$(cd $(FN_PATH)/crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk) && \
	export IMAGE_TAG=$(IMAGE_TAG) && \
	docker-compose -f fabric-ca-server/docker-compose-ca.yaml down

clean:
	cd $(FN_PATH) && ./byfn.sh down

force-clean:
	docker ps -qa | xargs docker stop # \
	docker ps -qa | xargs docker rm # \
	docker volume rm $$(docker volume ls -q) -f # \
	docker network prune # \
	rm -rf fabric-samples # \
	rm bootstrap.sh

build-client:
	./scripts/build-client.sh

build-ldap:
	./scripts/build-ldap.sh
