.PHONY: generate artifacts up clean build-client build-orchestrator build-ldap build-db
.PHONY: up-orchestrator down-orchestrator upgrade sp_deploy restart-app invoke-cc query-cc

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

generate: up-orchestrator artifacts build-ldap build-db build-client

artifacts: up-orchestrator
	docker exec orchestrator python3 network.py generate $(ARGS)

up: up-orchestrator
	docker exec orchestrator python3 network.py up $(ARGS)

clean:
	docker exec orchestrator python3 network.py clean $(ARGS)
	docker-compose -f orchestrator/docker-compose.yml down

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

build-db:
	./scripts/build-db.sh

up-orchestrator: build-orchestrator
	docker-compose -f orchestrator/docker-compose.yml up -d

down-orchestrator:
	docker-compose -f orchestrator/docker-compose.yml down

upgrade:
	docker exec -ti orchestrator python3 network.py upgrade $(ARGS)

restart-app:
	docker restart app.bank-belveb-by.nsd.ru app.bank-mkb-ru.nsd.ru

invoke-cc:
	python3 test/nsd_test.py invoke

query-cc:
	python3 test/nsd_test.py query
