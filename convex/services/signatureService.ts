const signingPublicKey = process.env.RSA_SIGNING_PUBLIC_KEY!;
const signingPrivateKey = process.env.RSA_SIGNING_PRIVATE_KEY!;

export class SignatureService {
  #publicKey?: CryptoKey;
  #privateKey?: CryptoKey;

  private _encode64(data: string): string {
    const bytes = new TextEncoder().encode(data);
    return btoa(String.fromCodePoint(...bytes));
  }

  private _decode64(base64data: string): string {
    const bytes = Uint8Array.from(atob(base64data), (c) => c.codePointAt(0)!);
    return new TextDecoder().decode(bytes);
  }

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

    // replace the fucking en dash with a hyphen
    let encodedData;
    let dataString = JSON.stringify(data);

    // if there's an invalid charactrer, log the string and throw back the error
    try {
      encodedData = this._encode64(dataString);
    } catch (e) {
      console.log(dataString);
      throw e;
    }

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

    const [encoded, base64Signature] = signature.split(".");
    const signatureBytes = Uint8Array.from(atob(base64Signature), (c) =>
      c.charCodeAt(0),
    );

    const isValid = await crypto.subtle.verify(
      { name: "RSA-PSS", saltLength: 32 },
      this.#publicKey,
      signatureBytes,
      new TextEncoder().encode(encoded),
    );

    if (!isValid) {
      throw new Error("Invalid signature");
    }
    const dataString = this._decode64(encoded);

    const decodedData = JSON.parse(dataString) as T;
    return decodedData;
  }
}
