#!/bin/bash
set -e

port="8545"

printf "\nKilling all local eth node processes"
printf "\n------------------------- \n"

printf "\nThis script searches for local eth rpc processes running on port %s and performs a kill 9 on each pid" "$port"

printf "\n------------------------- \n"

printf "\nPrinting output from command: lsof -i :%s \n" "$port"

lsof -i :$port

#Getting ink! node process IDs and eth rpc v process IDs
printf "\nExtracting ink-node process ids..."
printf "\n------------------------- \n"

eth_rpc_v_pids=$(lsof -i :$port | grep -oE 'eth-rpc-v\s[0-9]{4,5}' | sed 's/eth-rpc-v[[:space:]]//g' | xargs echo -n)

printf "Found eth rpc nodes running on the following process ids: %s \n" "$eth_rpc_v_pids"

printf "\nExecuting command: %s for each pid \n" "kill -9"

#kill eth node processes
# shellcheck disable=SC2086
kill -9 $eth_rpc_v_pids

