.PHONY: generate artifacts up-network up-ldap clean build-client build-ldap
.PHONY:

ARGS = --local --config hosts.yml

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
	cd first-network && ./byfn.sh generate

up-network:
	cd first-network && export CERTIFICATE_AUTHORITIES=true && ./byfn.sh up

up-ldap:
	docker-compose -f ldap/docker-compose-ldap.yml up -d

clean:
	cd first-network && ./byfn.sh down

force-clean:
	docker ps -qa | xargs docker stop
	docker ps -qa | xargs docker rm
	docker volume rm $$(docker volume ls -q) -f
	docker network prune

build-client:
	./scripts/build-client.sh

build-orchestrator:
	./scripts/build-orchestrator.sh

build-ldap:
	./scripts/build-ldap.sh
