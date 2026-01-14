#!/bin/bash

set -e

printf "\n Executing Graph QL cURL request for Solana Block by Number \n"
printf "\n ------------------------- \n"

curl 'http://127.0.0.1:3000/graphql' -H 'Accept-Encoding: gzip, deflate, br' \
-H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Connection: keep-alive' \
-H 'DNT: 1' -H 'Origin: http://127.0.0.1:3000' \
--data-binary '{"query":"{\n  getSolanaBlockByNumber(blockNumber: \"393324959\") {\n        creationDate,\n        blockNumber,\n        hash,\n        transactionCount\n  }\n}"}' --compressed