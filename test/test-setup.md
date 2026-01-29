## Testcontainers

Anvil:
https://www.npmjs.com/package/@hellaweb3/foundryanvil-testcontainers-nodejs


----

## Wiremock

Wiremock can capture and replay API calls to mock external services.

### Record and playback:

Use record and playback to capture mocks from external API calls

- Read for more context: https://wiremock.org/docs/record-playback/

#### Capturing mocks:

Update `.env` file to point to Wiremock container which will proxy requests to the sandbox.

```dotenv
REAP_BASE_URL=http://localhost:8080
```

Run the project

```shell
pnpm dev
```

Start up Wiremock Docker container with recording enabled.

Run this in the project root:

```shell
docker run -it --rm \
-p 8080:8080 \
-v $PWD/test/__mocks__/wiremock:/home/wiremock \
--name wiremock \
wiremock/wiremock:latest \
--enable-browser-proxying \
--proxy-all="https://sandbox.api.caas.reap.global" \
--preserve-host-header=false \
--trust-all-proxy-targets \
--record-mappings --verbose
```

**Navigate to:**  http://localhost:8080/__admin/recorder/

Enter target URL. Base URL from `.env` file.

- Reap: https://sandbox.api.caas.reap.global

Press `Record` button.

The files will be saved to `./test/__mocks__/wiremock`