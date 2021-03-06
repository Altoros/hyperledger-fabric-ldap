.PHONY: bootstrap
.PHONY: all generate artifacts build-client build-ldap up ss-certs restart install-cc upgrade-cc
.PHONY: clean force-clean app-restart app-force-restart

-include .env
-include .makerc

FN_PATH = fabric-samples/first-network
PROJECT_PATH = ${CURDIR}
UP_NETWORK_OPTIONS = up -o ${CONSENSUS} -c ${CHANNEL_NAME} -s ${IF_COUCHDB}
EXTERNAL_SERVICES = -f ../../docker-compose-cli.yaml
BOOTSTRAP_OPTIONS = ${VERSION} ${CA_VERSION} ${THIRDPARTY_IMAGE_VERSION}
v = ${CHAINCODE_VERSION}

help:
	@echo "LDAP Integration Simple Demo"
	@echo ""
	@echo "all: run full scenario including generate certs, bring up the HLF network and istall smart-contracts"
	@echo "generate: generate artifacts with crypto material, configs and docker-compose templates"
	@echo "          build LDAP-server and Web-client"
	@echo "		     generate self-signed certificates"
	@echo "build-client: build Web-client (building occurs inside docker container, no Node dependency)"
	@echo "build-ldap: build LDAP-server"
	@echo "artifacts: generate all the HLF Network's artifacts"
	@echo "ss-certs: generate self-signed certificates, which are used for TLS connection to LDAP-server"
	@echo "up: bring up the HLF network with external services"
	@echo "install-cc: install and instantiate smart contract"
	@echo "upgrade-cc v=2.0: upgrade smart contract to new version, e.g. v=2.0"
	@echo "clean: remove docker containers, volumes, self-signed certs and wallets"
	@echo "force-clean: remove docker containers, volumes, self-signed certs, wallets, networks and downloads"
	@echo "restart: clean all the HLF Network artifacts and run bringing up process again"
	@echo "app-restart: restart only Web-client's docker containers"
	@echo "app-force-restart: restart only Web-client's docker containers with rebuild Web-client"
	@echo "app-force-stop: stop only Web-client's docker containers with remove containers and volumes"

all: generate up install-cc restart-app

restart: clean all

generate: artifacts build-ldap build-client

bootstrap:
	$(eval $(call build_bootstrap_options))
	curl -sS https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh -o ./bootstrap.sh && \
	chmod +x ./bootstrap.sh && \
	./bootstrap.sh $(BOOTSTRAP_OPTIONS)

artifacts: ss-certs
	cd ${FN_PATH} && \
	echo y | ./byfn.sh generate -c $(CHANNEL_NAME)

up: generate
	$(eval $(call build_up_network_options))
	cd ${FN_PATH} && \
	echo y | ./byfn.sh ${UP_NETWORK_OPTIONS} && \
	docker rename ca_peerOrg1 ca.org1.example.com && \
    docker rename ca_peerOrg2 ca.org2.example.com

clean: app-force-stop
	cd $(FN_PATH) && \
	echo y | ./byfn.sh down # \
	sudo rm -rf $(PROJECT_PATH)/ss-certs # \
    sudo rm -rf $(PROJECT_PATH)/wallet

force-clean:
	docker ps -qa | xargs docker stop # \
	docker ps -qa | xargs docker rm # \
	docker volume rm $$(docker volume ls -q) -f # \
	echo y | docker network prune # \
	rm -rf fabric-samples # \
	rm bootstrap.sh # \
	rm -rf ss-certs # \
	sudo rm -rf wallet

build-client:
	./scripts/build-client.sh

build-ldap:
	./scripts/build-ldap.sh

app-restart:
	docker restart app.org1.example.com app.org2.example.com

app-force-stop:
	$(eval $(call build_up_network_options))
	docker stop app.org1.example.com app.org2.example.com # \
	docker rm app.org1.example.com app.org2.example.com # \
	docker-compose -f ./app/docker-compose-app.yaml down

app-force-restart: build-client
	$(eval $(call build_up_network_options))
	docker stop app.org1.example.com app.org2.example.com # \
	docker rm app.org1.example.com app.org2.example.com # \
	docker-compose -f ./app/docker-compose-app.yaml up -d # \
	docker network connect net_byfn app.org1.example.com # \
	docker network connect net_byfn app.org2.example.com

ss-certs:
	./scripts/gen-ss-certs.sh

install-cc:
	export CHAINCODE_VERSION=${v} && \
	./scripts/install-demo.sh

upgrade-cc:
	export CHAINCODE_VERSION=${v} && \
	./scripts/upgrade-demo.sh

add-user:
	docker exec -ti ldap.org1.example.com /container/service/slapd/add-modify.sh
	docker exec -ti ldap.org2.example.com /container/service/slapd/add-modify.sh