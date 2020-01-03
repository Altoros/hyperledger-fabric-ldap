.PHONY: generate artifacts up-network clean build-client build-ldap
.PHONY: up-ldap up-ca down-ldap down-ca

ARGS = --local --config hosts.yml
FN_PATH = ./first-network
IMAGE_TAG = latest

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

artifacts:
	cd $(FN_PATH) && \
	./byfn.sh generate

up-network:
	cd $(FN_PATH) && \
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
	export IMAGE_TAG=latest && \
	docker-compose -f fabric-ca/docker-compose-ca.yaml down

clean:
	cd first-network && ./byfn.sh down

force-clean:
	docker ps -qa | xargs docker stop
	docker ps -qa | xargs docker rm
	docker volume rm $$(docker volume ls -q) -f
	docker network prune

build-client:
	./scripts/build-client.sh

build-ldap:
	./scripts/build-ldap.sh
