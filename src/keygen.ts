import fs from "fs";

async function generateEncryptionKeys() {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

  const spki = await crypto.subtle.exportKey("spki", publicKey);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(spki)));

  const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);
  const base64pkcs8 = btoa(String.fromCharCode(...new Uint8Array(pkcs8)));

  fs.appendFileSync(
    ".env.local",
    `\nRSA_PUBLIC_KEY='${base64}'\nRSA_PRIVATE_KEY='${base64pkcs8}'\n`,
  );
}

async function generateSigningKeys() {
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  );

  const spki = await crypto.subtle.exportKey("spki", publicKey);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(spki)));

  const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);
  const base64pkcs8 = btoa(String.fromCharCode(...new Uint8Array(pkcs8)));

  fs.appendFileSync(
    ".env.local",
    `\nRSA_SIGNING_PUBLIC_KEY='${base64}'\nRSA_SIGNING_PRIVATE_KEY='${base64pkcs8}'\n`,
  );
}

async function main() {
  await generateEncryptionKeys();
  await generateSigningKeys();
}

main();
