#!/usr/bin/env bash

echo "Building openldap"

cd ldap/
docker build -t demo/openldap:latest .
