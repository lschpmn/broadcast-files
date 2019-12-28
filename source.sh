#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )";
BIN=$DIR/node_modules/.bin
PATH=$PATH:$BIN;
alias start-server="nodemon ./server/index.ts -w ./server/ </dev/null"
alias start-client="electron index.js | grep -v ERROR:CONSOLE";
alias start="start-server & start-client &";
