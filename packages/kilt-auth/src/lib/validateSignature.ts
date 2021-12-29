import * as Kilt from '@kiltprotocol/sdk-js';
import { signatureVerify } from '@polkadot/util-crypto';

export default async function validateSignature(input: string, did: string, signature: string) {
  Kilt.config({ address: process.env.KILT_ADDRESS });
  await Kilt.connect();

  const didDocument = await Kilt.Did.DefaultResolver.resolveDoc(did);
  if (!didDocument) {
    throw new Error('Could not resolve DID');
  }

  const { details } = didDocument;
  const publicKey = details.getKeys(Kilt.KeyRelationship.authentication).pop();
  if (!publicKey) {
    throw new Error('Could not find the key');
  }

  await Kilt.disconnect();

  const isValid = signatureVerify(input, signature, publicKey.publicKeyHex).isValid;
  if (!isValid) {
    throw new Error('Signature Not Verified');
  }
  return isValid;
}
