import { createHash } from "crypto";
import { UbiquityRpcProvider } from "./rpc-provider";

export class ContractInteraction {
  private _rpcProvider: UbiquityRpcProvider;
  private _chainId: number;
  private _contractAddress: string;

  constructor(ubiquityRpcProvider: UbiquityRpcProvider, chainId: number, contractAddress: string) {
    this._rpcProvider = ubiquityRpcProvider;
    this._chainId = chainId;
    this._contractAddress = contractAddress;
  }

  private _keccak256(data: string): string {
    return "0x" + createHash("sha3-256").update(Buffer.from(data, "utf8")).digest("hex");
  }

  private _encodeFunctionSignature(functionFragment: string): string {
    const hash = this._keccak256(functionFragment);
    return hash.substring(0, 10); // First 4 bytes (8 hex chars) for the function selector
  }

  private _encodeParameters(types: string[], values: unknown[]): string {
    const head: string[] = [];
    const tail: string[] = [];
    let dynamicOffset = types.length * 32;

    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const value = values[i];

      if (this._isDynamicType(type)) {
        // Store the offset placeholder
        head.push(dynamicOffset.toString(16).padStart(64, "0"));
        const encodedValue = this._encodeType(type, value);
        tail.push(encodedValue);
        dynamicOffset += encodedValue.length / 2;
      } else {
        const encodedValue = this._encodeType(type, value);
        head.push(encodedValue);
      }
    }

    return head.join("") + tail.join("");
  }

  private _encodeType(type: string, value: unknown): string {
    if (["uint256", "uint128", "int256", "int128"].includes(type)) {
      return this._encodeIntegerType(value);
    }

    if (type === "address") {
      return this._encodeAddressType(value);
    }

    if (type === "bool") {
      return this._encodeBoolType(value);
    }

    if (type.startsWith("bytes") && type !== "bytes") {
      return this._encodeFixedBytesType(type, value);
    }

    if (type === "bytes" || type === "string") {
      return this._encodeDynamicType(type, value);
    }

    if (type.endsWith("[]")) {
      return this._encodeArrayType(type, value);
    }

    if (type.startsWith("tuple")) {
      return this._encodeTupleType(type, value);
    }

    throw new Error(`Unsupported or unimplemented type: ${type}`);
  }

  // Helper methods
  private _encodeIntegerType(value: unknown): string {
    return BigInt(value as number)
      .toString(16)
      .padStart(64, "0");
  }

  private _encodeAddressType(value: unknown): string {
    return (value as string).toLowerCase().replace("0x", "").padStart(64, "0");
  }

  private _encodeBoolType(value: unknown): string {
    return (value ? "1" : "0").padStart(64, "0");
  }

  private _encodeFixedBytesType(type: string, value: unknown): string {
    const size = parseInt(type.slice(5));
    return (value as string)
      .replace("0x", "")
      .padEnd(size * 2, "0")
      .slice(0, size * 2)
      .padEnd(64, "0");
  }

  private _encodeDynamicType(type: string, value: unknown): string {
    const hexValue = type === "string" ? Buffer.from(value as string, "utf8").toString("hex") : (value as string).replace("0x", "");
    const length = (hexValue.length / 2).toString(16).padStart(64, "0");
    const paddedValue = hexValue.padEnd(Math.ceil(hexValue.length / 64) * 64, "0");
    return length + paddedValue;
  }

  private _encodeArrayType(type: string, value: unknown): string {
    const baseType = type.slice(0, -2);
    const arrayValues = value as unknown[];
    const length = arrayValues.length.toString(16).padStart(64, "0");
    let encodedArray = "";
    for (const item of arrayValues) {
      encodedArray += this._encodeType(baseType, item);
    }
    return length + encodedArray;
  }

  private _encodeTupleType(type: string, value: unknown): string {
    const tupleTypes = this._parseTupleTypes(type);
    const tupleValues = value as unknown[];
    return this._encodeParameters(tupleTypes, tupleValues);
  }

  private _isDynamicType(type: string): boolean {
    return type === "string" || type === "bytes" || type.endsWith("[]") || (type.startsWith("bytes") && type === "bytes");
  }

  private _parseTupleTypes(type: string): string[] {
    // Parse tuple types, e.g., tuple(uint256,address)
    const match = type.match(/^tuple\((.*)\)$/);
    if (match && match[1]) {
      const types: string[] = [];
      let currentType = "";
      let depth = 0;
      for (const char of match[1]) {
        if (char === "(") {
          depth++;
        } else if (char === ")") {
          depth--;
        }

        if (char === "," && depth === 0) {
          types.push(currentType);
          currentType = "";
        } else {
          currentType += char;
        }
      }
      if (currentType) {
        types.push(currentType);
      }
      return types;
    }
    throw new Error(`Invalid tuple type: ${type}`);
  }

  private _decodeParameters(types: string[], data: string): unknown[] {
    const results = [];
    let offset = 0;
    for (const type of types) {
      const dataSlice = data.substring(2 + offset, 2 + offset + 64);
      if (type === "uint256") {
        results.push(BigInt("0x" + dataSlice));
      } else if (type === "address") {
        results.push("0x" + dataSlice.substring(24));
      } else if (type === "bool") {
        results.push(dataSlice === "0".repeat(63) + "1");
      } else if (type.startsWith("bytes")) {
        results.push("0x" + dataSlice);
      } else if (type === "string") {
        const lengthHex = dataSlice;
        const length = parseInt(lengthHex, 16) * 2;
        const valueSlice = data.substring(2 + offset + 64, 2 + offset + 64 + length);
        results.push(Buffer.from(valueSlice, "hex").toString("utf8"));
        offset += length;
      } else {
        throw new Error(`Unsupported type: ${type}`);
      }
      offset += 64;
    }
    return results;
  }

  public async callMethod(methodName: string, params: unknown[]): Promise<unknown> {
    const methodSignatures: { [key: string]: { inputs: string[]; outputs: string[] } } = {
      balanceOf: {
        inputs: ["address"],
        outputs: ["uint256"],
      },
      // Add other method signatures here
    };

    if (!methodSignatures[methodName]) {
      throw new Error(`Method ${methodName} not found in method signatures`);
    }

    const { inputs, outputs } = methodSignatures[methodName];

    const functionSignature = `${methodName}(${inputs.join(",")})`;
    const functionSelector = this._encodeFunctionSignature(functionSignature);
    const encodedParams = this._encodeParameters(inputs, params);
    const data = functionSelector + encodedParams;

    const payload = {
      method: "eth_call",
      params: [
        {
          to: this._contractAddress,
          data,
        },
        "latest",
      ],
    };

    try {
      const response = await this._rpcProvider.sendRequest(this._chainId, payload);
      if (response.result && response.result !== "0x") {
        const decodedResult = this._decodeParameters(outputs, response.result as string);
        return decodedResult.length === 1 ? decodedResult[0] : decodedResult;
      }
      return null;
    } catch (error) {
      console.error(`Error calling method ${methodName}:`, error);
      return null;
    }
  }
}
