const signingPublicKey = process.env.RSA_SIGNING_PUBLIC_KEY!;
const signingPrivateKey = process.env.RSA_SIGNING_PRIVATE_KEY!;

export class SignatureService {
  #publicKey?: CryptoKey;
  #privateKey?: CryptoKey;

  public async sign<T>(data: T): Promise<string> {
    if (!this.#privateKey) {
      this.#privateKey = await crypto.subtle.importKey(
        "pkcs8",
        Uint8Array.from(atob(signingPrivateKey), (c) => c.charCodeAt(0)),
        { name: "RSA-PSS", hash: "SHA-256" },
        false,
        ["sign"],
      );
    }

    const encodedData = btoa(JSON.stringify(data));

    const signature = await crypto.subtle.sign(
      { name: "RSA-PSS", saltLength: 32 },
      this.#privateKey,
      new TextEncoder().encode(encodedData),
    );

    const base64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

    return `${encodedData}.${base64}`;
  }

  public async verify<T>(signature: string): Promise<T> {
    if (!this.#publicKey) {
      this.#publicKey = await crypto.subtle.importKey(
        "spki",
        Uint8Array.from(atob(signingPublicKey), (c) => c.charCodeAt(0)),
        { name: "RSA-PSS", hash: "SHA-256" },
        false,
        ["verify"],
      );
    }

    const [base64data, base64Signature] = signature.split(".");
    const signatureBytes = Uint8Array.from(atob(base64Signature), (c) =>
      c.charCodeAt(0),
    );

    const isValid = await crypto.subtle.verify(
      { name: "RSA-PSS", saltLength: 32 },
      this.#publicKey,
      signatureBytes,
      new TextEncoder().encode(base64data),
    );

    if (!isValid) {
      throw new Error("Invalid signature");
    }

    const decodedData = JSON.parse(atob(base64data)) as T;
    return decodedData;
  }
}
