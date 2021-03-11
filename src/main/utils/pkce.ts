import { createHash, randomBytes } from 'crypto';

// Taken from https://github.com/crouchcd/pkce-challenge#readme

/** Generate cryptographically secure random string
 * @param {number} size The desired length of the string
 * @param {string} mask A mask of characters (no more than 256) to choose from
 * @returns {string} The random string
 */
function random(size: number, mask: string | any[]) {
  let result = '';
  const randomIndices = randomBytes(size);
  const byteLength = 2 ** 8; // 256
  const maskLength = Math.min(mask.length, byteLength);
  // the scaling factor breaks down the possible values of bytes (0x00-0xFF)
  // into the range of mask indices
  const scalingFactor = byteLength / maskLength;
  for (let i = 0; i < size; i += 1) {
    const randomIndex = Math.floor(randomIndices[i] / scalingFactor);
    result += mask[randomIndex];
  }
  return result;
}

/** Base64 url encode a string
 * @param {string} base64 The base64 string to url encode
 * @returns {string} The base64 url encoded string
 */
function base64UrlEncode(base64: string) {
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/** Generate a PKCE challenge verifier
 * @param {number} length Length of the verifier
 * @returns {string} A random verifier `length` characters long
 */
function generateVerifier(length: number) {
  const mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~';
  return random(length, mask);
}

/** Generate a PKCE challenge code from a verifier
 * @param {string} code_verifier
 * @returns {string} The base64 url encoded code challenge
 */
function generateChallenge(code_verifier: string) {
  const hash = createHash('sha256').update(code_verifier).digest('base64');
  return base64UrlEncode(hash);
}

/** Generate a PKCE challenge pair
 * @param {number} [length=43] Length of the verifer (between 43-128)
 * @returns {{code_challenge:string,code_verifier:string}} PKCE challenge pair
 */
export function pkceChallenge(length?: number) {
  if (!length) length = 43;

  if (length < 43 || length > 128) {
    throw new Error(`Expected a length between 43 and 128. Received ${length}.`);
  }

  const verifier = generateVerifier(length);
  const challenge = generateChallenge(verifier);

  return {
    codeChallenge: challenge,
    codeVerifier: verifier
  };
}
