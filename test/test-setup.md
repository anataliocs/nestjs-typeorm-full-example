
## Testcontainers

Anvil:
https://www.npmjs.com/package/@hellaweb3/foundryanvil-testcontainers-nodejs


----

## Wiremock

Run Wiremock:

```shell
docker run -it --rm \
-p 8080:8080 \
--name wiremock \
wiremock/wiremock:3.13.2
```

### Record and playback:

Use record and playback to capture mocks from external API calls

https://wiremock.org/docs/record-playback/