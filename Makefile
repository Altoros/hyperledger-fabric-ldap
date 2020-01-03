.PHONY: bootstrap
.PHONY: generate artifacts up-network up-ldap up-network build-client build-ldap
.PHONY: down-ldap down-ca clean force-clean

FS_PATH = ./
FN_PATH = $(FS_PATH)/fabric-samples/first-network
BIN_PATH = ./
IMAGE_TAG = latest

VERSION = 1.4.4
CA_VERSION = 1.4.4
THIRDPARTY_IMAGE_VERSION = 0.4.18

SAMPLES = true
BINARIES = true
DOCKER = false

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
	export SAMPLES=$(SAMPLES) && \
	export BINARIES=$(BINARIES) && \
	export DOCKER=$(DOCKER) && \
	./bootstrap.sh $(VERSION) $(CA_VERSION) $(THIRDPARTY_IMAGE_VERSION)

artifacts:
	cd $(FN_PATH) && \
	./byfn.sh generate

up-network:
	cd $(FN_PATH) && \
	export IMAGE_TAG=$(IMAGE_TAG) && \
	./byfn.sh up

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
