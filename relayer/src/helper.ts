export function routeToHex(route: String) {
    return "0x" + Buffer.from(route, "utf8").toString("hex");
}
  
export function receiptProofToHex(receiptProof: Buffer[][]): string {
    const flat = receiptProof.flat();
    const concatenated = Buffer.concat(flat);
    return "0x" + concatenated.toString('hex');
}