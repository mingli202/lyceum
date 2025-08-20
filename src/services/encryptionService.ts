export class EncryptionService {
  #publicKey: CryptoKey;
  #privateKey: CryptoKey;

  constructor(publicKey: CryptoKey, privateKey: CryptoKey) {
    this.#publicKey = publicKey;
    this.#privateKey = privateKey;
  }

  static async new(publicKeyString: string, privateKeyString: string) {
    const publicKey = await crypto.subtle.importKey(
      "spki",
      Uint8Array.from(atob(publicKeyString), (t) => t.charCodeAt(0)),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"],
    );

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      Uint8Array.from(atob(privateKeyString), (t) => t.charCodeAt(0)),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"],
    );

    return new EncryptionService(publicKey, privateKey);
  }

  async decrypt(value: string): Promise<string | null> {
    const decrypted = await crypto.subtle
      .decrypt(
        { name: "RSA-OAEP" },
        this.#privateKey,
        Uint8Array.from(atob(value), (t) => t.charCodeAt(0)),
      )
      .then((res) => new TextDecoder().decode(res))
      .catch(() => null);

    return decrypted;
  }

  async encrypt(value: string): Promise<string> {
    const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      this.#publicKey,
      new TextEncoder().encode(value),
    );

    const base64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

    return base64;
  }
}
