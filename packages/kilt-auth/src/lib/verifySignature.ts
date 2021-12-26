import * as Kilt from "@kiltprotocol/sdk-js";
import { signatureVerify } from "@polkadot/util-crypto";
import envy from "envy";

const env = envy();

export default async function validateSignature(input, did, signature) {
  Kilt.config({ address: env.nodeAddress });
  await Kilt.connect();

  const didDocument = await Kilt.Did.DefaultResolver.resolveDoc(did);
  if (!didDocument) {
    throw new Error("Could not resolve DID");
  }

  const { details } = didDocument;
  const publicKey = details.getKeys(Kilt.KeyRelationship.authentication).pop();
  if (!publicKey) {
    throw new Error("Could not find the key");
  }

  await Kilt.disconnect();

  return signatureVerify(input, signature, publicKey.publicKeyHex).isValid === true;
}
