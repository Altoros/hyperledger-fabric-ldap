#!/usr/bin/env bash

if [ -d $CC_PATH/vendor ]
then
    echo Directory $CC_PATH/vendor exists.
else
    echo Vendoring Go dependencies ...
    pushd $CC_PATH
    GO111MODULE=on go mod vendor
    popd
    echo Finished vendoring Go dependencies
fi
