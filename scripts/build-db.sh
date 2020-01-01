#!/usr/bin/env bash

echo "Building db"

cd db/
docker build -t nsd/db:latest .
