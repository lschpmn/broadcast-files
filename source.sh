#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )";
BIN=$DIR/node_modules/.bin
PATH=:$BIN:$DIR/bin:$PATH;
alias start-server="nodemon ./server/index.ts -w ./server/ </dev/null"
alias start-client="ts-node index.ts";
alias start="start-server & start-client &";
