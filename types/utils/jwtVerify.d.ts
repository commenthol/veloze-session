/// <reference types="node" />
/**
 * @param {string} token
 * @returns {{
 *  header: object|null
 *  payload: object|null
 *  headerPayload64: string
 *  parts: (Buffer|undefined)[]
 * }}
 */
export function jwtDecode(token: string): {
    header: object | null;
    payload: object | null;
    headerPayload64: string;
    parts: (Buffer | undefined)[];
};
/**
 * @typedef {{
 *  secret?: string|crypto.RsaPrivateKey
 *  publicKey?: crypto.KeyLike
 *  audiences?: string[]
 * }} JwtVerifyOptions
 * - secret: HSxxx secret
 * - publicKey: RSxxx public key
 * - audiences: list of allowed audiences
 */
/**
 * @param {{
 *  header: object|null
 *  payload?: object|null
 *  headerPayload64: string
 *  parts: (Buffer|undefined)[]
 * }} decoded
 * @param {JwtVerifyOptions} options
 * @returns {boolean}
 */
export function verifySignature(decoded: {
    header: object | null;
    payload?: object | null;
    headerPayload64: string;
    parts: (Buffer | undefined)[];
}, options: JwtVerifyOptions): boolean;
/**
 * @param {string} token
 * @param {JwtVerifyOptions} options
 * @returns {{ header: object, payload: object }|undefined}
 */
export function jwtVerify(token: string, options: JwtVerifyOptions): {
    header: object;
    payload: object;
} | undefined;
/**
 * - secret: HSxxx secret
 * - publicKey: RSxxx public key
 * - audiences: list of allowed audiences
 */
export type JwtVerifyOptions = {
    secret?: string | crypto.RsaPrivateKey;
    publicKey?: crypto.KeyLike;
    audiences?: string[];
};
import * as crypto from 'crypto';
