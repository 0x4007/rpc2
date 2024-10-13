declare module "*.json" {
  const value: ReadonlyArray<import("@ethersproject/abi").JsonFragment>;
  export default value;
}
