import type {
  StartedWiremockContainer,
  WiremockRequestCriteria,
  WiremockStubMapping,
} from '@hellaweb3/wiremock-testcontainers-nodejs';

/**
 * WireMock as a fault-injecting proxy in front of anvil.
 *
 *   app ──▶ WireMock `/rpc` ──proxy──▶ anvil:8545   (shared Docker network)
 *
 * Anvil produces every JSON-RPC response; WireMock only forwards them, unless a
 * higher-priority fault stub – added at runtime per test, dropped again by
 * `wiremock.reset()` – intercepts calls to one specific method.
 */

/** Path the app's ethers provider is pointed at on the WireMock container. */
export const RPC_PATH = '/rpc';

/** Network alias of the anvil container, as seen from WireMock. */
export const ANVIL_ALIAS = 'anvil';

/** Transparent proxy: everything under `/rpc` is forwarded to anvil. */
export const PROXY_TO_ANVIL: WiremockStubMapping = {
  priority: 100,
  request: { method: 'ANY', urlPath: RPC_PATH },
  response: {
    proxyBaseUrl: `http://${ANVIL_ALIAS}:8545`,
    proxyUrlPrefixToRemove: RPC_PATH,
  },
};

/**
 * Journal criteria for HTTP requests carrying a call to `method`, sent on its
 * own or inside a batch – ethers serialises JSON without whitespace.
 */
export function callsTo(method: string): WiremockRequestCriteria {
  return {
    method: 'POST',
    urlPath: RPC_PATH,
    bodyPatterns: [{ contains: `"method":"${method}"` }],
  };
}

/**
 * A stub overriding every request that calls `method` with `response` (a
 * status, a WireMock `fault`, a delayed proxy…). `extra` passes stub fields
 * such as `scenarioName` through.
 *
 * Never target `eth_chainId`: the app's ethers provider retries network
 * detection forever, so the app would not boot.
 */
export function failCallsTo(
  method: string,
  response: object,
  extra: Record<string, unknown> = {},
): WiremockStubMapping {
  return { priority: 1, request: callsTo(method), response, ...extra };
}

/** Registers stubs at runtime; `wiremock.reset()` removes them again. */
export async function addStubs(
  wiremock: StartedWiremockContainer,
  ...stubs: WiremockStubMapping[]
): Promise<void> {
  for (const stub of stubs) {
    const res = await fetch(wiremock.getMappingUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stub),
    });
    if (!res.ok) {
      throw new Error(
        `WireMock rejected stub (${res.status}): ${await res.text()}`,
      );
    }
  }
}

export interface JsonRpcCall {
  readonly jsonrpc: string;
  readonly id: number;
  readonly method: string;
  readonly params: unknown[];
}

/** The JSON-RPC calls inside one recorded HTTP body, batched or not. */
export function parseRpcCalls(body: string | undefined): JsonRpcCall[] {
  const parsed = JSON.parse(body || '[]') as JsonRpcCall | JsonRpcCall[];
  return Array.isArray(parsed) ? parsed : [parsed];
}

/** Every JSON-RPC call the app sent through the proxy since the last reset. */
export async function recordedRpcCalls(
  wiremock: StartedWiremockContainer,
): Promise<JsonRpcCall[]> {
  const requests = await wiremock.findRequests({
    method: 'POST',
    urlPath: RPC_PATH,
  });
  return requests.flatMap((r) => parseRpcCalls(r.body));
}
