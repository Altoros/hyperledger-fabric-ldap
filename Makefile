.PHONY: bootstrap
.PHONY: generate artifacts build-client build-ldap up ss-certs
.PHONY: clean force-clean

-include .env
-include .makerc

FN_PATH = ${FS_PATH}/fabric-samples/first-network

UP_NETWORK_OPTIONS = up -o ${CONSENSUS} -c ${CHANNEL_NAME} -s ${IF_COUCHDB}
EXTERNAL_SERVICES = -f ../../docker-compose-cli.yaml

BOOTSTRAP_OPTIONS = ${VERSION} ${CA_VERSION} ${THIRDPARTY_IMAGE_VERSION}

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
	$(eval $(call build_bootstrap_options))
	curl -sS https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh -o ./bootstrap.sh && \
	chmod +x ./bootstrap.sh && \
	./bootstrap.sh $(BOOTSTRAP_OPTIONS)

artifacts: ss-certs
	cd ${FN_PATH} && \
	echo y | ./byfn.sh generate -c $(CHANNEL_NAME)

up:
	$(eval $(call build_up_network_options))
	cd ${FN_PATH} && \
	echo y | ./byfn.sh ${UP_NETWORK_OPTIONS} && \
	docker rename ca_peerOrg1 ca.org1.example.com && \
    docker rename ca_peerOrg2 ca.org2.example.com

clean:
	rm -rf ss-certs && \
	sudo rm -rf wallets && \
	cd $(FN_PATH) && \
	echo y | ./byfn.sh down

force-clean:
	docker ps -qa | xargs docker stop # \
	docker ps -qa | xargs docker rm # \
	docker volume rm $$(docker volume ls -q) -f # \
	echo y | docker network prune # \
	rm -rf fabric-samples # \
	rm bootstrap.sh # \
	rm -rf ss-certs # \
	sudo rm -rf wallets


build-client:
	./scripts/build-client.sh

build-ldap:
	./scripts/build-ldap.sh

restart-app:
	docker restart app.org1.example.com app.org2.example.com

ss-certs:
	./scripts/gen-ss-certs.sh

demo:
	./scripts/demo.sh
