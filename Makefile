.PHONY: bootstrap
.PHONY: generate artifacts up-network up-ldap up-network build-client build-ldap
.PHONY: down-ldap down-ca clean force-clean

FS_PATH = ./
FN_PATH = $(FS_PATH)/fabric-samples/first-network
IMAGE_TAG = latest

VERSION = 1.4.4
CA_VERSION = 1.4.4
THIRDPARTY_IMAGE_VERSION = 0.4.18

# solo, kafka or etcdraft
CONSENSUS = etcdraft
VERBOSE = false

UP_NETWORK_OPTIONS = up -o $(CONSENSUS)
ifeq ($(VERBOSE), true)
	UP_NETWORK_OPTIONS += -v
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

generate: artifacts build-ldap

bootstrap:
	curl -sS https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh -o ./bootstrap.sh && \
	chmod +x ./bootstrap.sh && \
	./bootstrap.sh $(BOOTSTRAP_OPTIONS)

artifacts:
	cd $(FN_PATH) && \
	./byfn.sh generate

up-network:
	cd $(FN_PATH) && \
	export IMAGE_TAG=$(IMAGE_TAG) && \
	./byfn.sh $(UP_NETWORK_OPTIONS)

up-ldap:
	docker-compose -f openldap/docker-compose-ldap.yaml up -d

up-ca:
	export BYFN_CA1_PRIVATE_KEY=$$(cd $(FN_PATH)/crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk) && \
    export BYFN_CA2_PRIVATE_KEY=$$(cd $(FN_PATH)/crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk) && \
    export IMAGE_TAG=$(IMAGE_TAG) && \
	docker-compose -f fabric-ca/docker-compose-ca.yaml up -d

down-ldap:
	docker-compose -f openldap/docker-compose-ldap.yaml down

down-ca:
	export BYFN_CA1_PRIVATE_KEY=$$(cd $(FN_PATH)/crypto-config/peerOrganizations/org1.example.com/ca && ls *_sk) && \
	export BYFN_CA2_PRIVATE_KEY=$$(cd $(FN_PATH)/crypto-config/peerOrganizations/org2.example.com/ca && ls *_sk) && \
	export IMAGE_TAG=$(IMAGE_TAG) && \
	docker-compose -f fabric-ca/docker-compose-ca.yaml down

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
