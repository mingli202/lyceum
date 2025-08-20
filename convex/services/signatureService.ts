export class SignatureService {
  #publicKey: CryptoKey;
  #privateKey: CryptoKey;

  constructor(publicKey: CryptoKey, privateKey: CryptoKey) {
    this.#publicKey = publicKey;
    this.#privateKey = privateKey;
  }

  static async new(
    publicKeyString: string,
    privateKeyString: string,
  ): Promise<SignatureService> {
    const publicKey = await crypto.subtle.importKey(
      "spki",
      Buffer.from(publicKeyString, "base64"),
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      Buffer.from(privateKeyString, "base64"),
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["sign"],
    );

    return new SignatureService(publicKey, privateKey);
  }

  async sign(base64Value: string): Promise<string> {
    const signed = await crypto.subtle.sign(
      { name: "RSA-PSS", saltLength: 32 },
      this.#privateKey,
      Buffer.from(base64Value, "base64"),
    );

    const base64 = btoa(String.fromCharCode(...new Uint8Array(signed)));

    return base64;
  }

  async verify(base64Signature: string, base64Data: string): Promise<boolean> {
    return await crypto.subtle.verify(
      { name: "RSA-PSS", saltLength: 32 },
      this.#publicKey,
      Buffer.from(base64Signature, "base64"),
      Buffer.from(base64Data, "base64"),
    );
  }
}
