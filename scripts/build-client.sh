#!/usr/bin/env bash

echo "Building web-application"

cd app/
docker build -t demo/app:latest .
