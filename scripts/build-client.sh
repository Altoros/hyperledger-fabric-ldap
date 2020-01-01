#!/usr/bin/env bash

echo "Building web-application"

cd app/
docker build -t nsd/app:latest .
