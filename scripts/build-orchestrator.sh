#!/usr/bin/env bash

echo "Building orchestrator tool"

cd orchestrator
docker build -t orchestrator:latest --build-arg path=$(pwd)/../ .
