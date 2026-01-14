#!/bin/bash

set -e

printf "\n Executing Graph QL cURL request for Ethereum block by number \n"
printf "\n ------------------------- \n"

curl 'http://127.0.0.1:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' \
-H 'Content-Type: application/json' -H 'Accept: application/json' \
-H 'Connection: keep-alive' -H 'DNT: 1' -H 'Origin: http://127.0.0.1:3000' \
--data-binary '{"query":"{\n  getBlockByNumber(blockNumber: 24068107) {\n        creationDate,\n        blockNumber,\n        hash,\n        nonce,\n        transactionCount\n  }\n}\n"}' --compressed