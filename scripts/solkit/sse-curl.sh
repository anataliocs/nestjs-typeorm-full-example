#!/bin/bash

set -e

# URL of the SSE endpoint
sseUrl="http://127.0.0.1:3000/solkit/sse/block-number/"

printf "\n Executing Server Sent Events cURL request for Solana block by number \n"
printf "\n ------------------------- \n"

# -N to prevent buffering -s for silent mode
curl -vs -N -H "Accept: text/event-stream" "$sseUrl" \
| while IFS= read -r line; do
    if [[ "$line" == data:* ]]; then
        payload="${line#data: }"

        echo "Received event: $payload"
    fi
done
