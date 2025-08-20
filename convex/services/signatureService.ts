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
      Uint8Array.from(atob(publicKeyString), (t) => t.charCodeAt(0)),
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      Uint8Array.from(atob(privateKeyString), (t) => t.charCodeAt(0)),
      { name: "RSA-PSS", hash: "SHA-256" },
      false,
      ["sign"],
    );

    return new SignatureService(publicKey, privateKey);
  }

  async sign(value: string): Promise<string> {
    const textEncoder = new TextEncoder();

    const signed = await crypto.subtle.sign(
      { name: "RSA-PSS", saltLength: 32 },
      this.#privateKey,
      textEncoder.encode(value),
    );

    const base64 = btoa(String.fromCharCode(...new Uint8Array(signed)));

    return base64;
  }

  async verify(signature: string, data: string): Promise<boolean> {
    return await crypto.subtle.verify(
      { name: "RSA-PSS", saltLength: 32 },
      this.#publicKey,
      Uint8Array.from(atob(signature), (t) => t.charCodeAt(0)),
      Uint8Array.from(atob(data), (t) => t.charCodeAt(0)),
    );
  }
}
