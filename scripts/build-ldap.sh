#!/usr/bin/env bash

echo "Building openldap"

cd openldap/
docker build -t demo/ldap:latest .
