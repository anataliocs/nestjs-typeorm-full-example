#!/bin/bash

set -e

printf "\n Funding Wallet \n"
printf "\n ------------------------- \n"

curl 'https://dev-peaq-faucet-service.cisys.xyz/get-test-tokens' \
  -H 'accept: application/json' \
  -H 'accept-language: en-US,en;q=0.9,es;q=0.8' \
  -H 'apikey: ' \
  -H 'content-type: application/json' \
  -H 'origin: https://docs.peaq.xyz' \
  -H 'priority: u=1, i' \
  -H 'referer: https://docs.peaq.xyz/' \
  -H 'sec-ch-ua: "Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"' \
  -H 'sec-ch-ua-mobile: ?1' \
  -H 'sec-ch-ua-platform: "Android"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: cross-site' \
  -H 'user-agent: Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36' \
  --data-raw '{"address":"0x0605fEe68FD827484bE330EFB4A2dBaC4811DfDc"}'