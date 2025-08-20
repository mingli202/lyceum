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
      Uint8Array.from(atob(publicKeyString), (c) => c.charCodeAt(0)),
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      Uint8Array.from(atob(privateKeyString), (c) => c.charCodeAt(0)),
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["sign"],
    );

    return new SignatureService(publicKey, privateKey);
  }

  async sign(data: string): Promise<string> {
    const signature = await crypto.subtle.sign(
      { name: "RSA-PSS", saltLength: 32 },
      this.#privateKey,
      new TextEncoder().encode(data),
    );

    const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return base64;
  }

  async verify(base64Signature: string, data: string): Promise<boolean> {
    const signature = Uint8Array.from(atob(base64Signature), (c) =>
      c.charCodeAt(0),
    );

    return await crypto.subtle.verify(
      { name: "RSA-PSS", saltLength: 32 },
      this.#publicKey,
      signature,
      new TextEncoder().encode(data),
    );
  }
}
