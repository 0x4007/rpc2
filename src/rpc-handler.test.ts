import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import fetch from "node-fetch";
import { RpcHandler } from "./rpc-handler";

// Mock node-fetch
jest.mock("node-fetch");

// Mock the storage
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

// Mock chain data
const mockChainData = [
  {
    name: "Ethereum Mainnet",
    chain: "ETH",
    rpc: ["https://mainnet.infura.io/v3/YOUR-PROJECT-ID", "https://api.mycryptoapi.com/eth"],
    chainId: 1,
  },
  {
    name: "Binance Smart Chain Mainnet",
    chain: "BSC",
    rpc: ["https://bsc-dataseed1.binance.org", "https://bsc-dataseed2.binance.org"],
    chainId: 56,
  },
];

describe("RpcHandler", () => {
  let rpcHandler: RpcHandler;

  beforeEach(() => {
    jest.resetAllMocks();
    // @ts-expect-error: Ignore type mismatch for testing purposes
    global.localStorage = mockStorage;
    rpcHandler = new RpcHandler(mockChainData);
  });

  test("constructor initializes with chain data and loads cache", () => {
    expect(mockStorage.getItem).toHaveBeenCalledWith("fastestRpcs");
  });

  test("_getFastestRpc returns cached RPC if available", async () => {
    const cachedRpc = "https://cached-rpc.example.com";
    // @ts-expect-error: Accessing private property for testing
    rpcHandler._fastestRpcs = { 1: cachedRpc };

    const result = await rpcHandler["_getFastestRpc"](1);
    expect(result).toBe(cachedRpc);
  });

  test("_getFastestRpc finds fastest RPC when not cached", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ result: "0x1234" }),
    } as Response);

    const result = await rpcHandler["_getFastestRpc"](1);
    expect(result).toBe(mockChainData[0].rpc[0]);
    expect(mockStorage.setItem).toHaveBeenCalled();
  });

  test("sendRequest uses fastest RPC and handles errors", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ result: "0x1234" }),
    } as Response);

    const payload = { jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 };
    const result = await rpcHandler.sendRequest(1, payload);

    expect(result).toEqual({ result: "0x1234" });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test("sendRequest tries alternative RPCs on failure", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValueOnce(new Error("RPC failed")).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ result: "0x5678" }),
    } as Response);

    const payload = { jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 };
    const result = await rpcHandler.sendRequest(1, payload);

    expect(result).toEqual({ result: "0x5678" });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockStorage.setItem).toHaveBeenCalled();
  });

  test("sendRequest throws error when all RPCs fail", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockRejectedValue(new Error("RPC failed"));

    const payload = { jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 };
    await expect(rpcHandler.sendRequest(1, payload)).rejects.toThrow("All RPC endpoints failed.");
  });
});
