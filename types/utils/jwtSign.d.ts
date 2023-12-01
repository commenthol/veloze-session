/// <reference types="node" />
/**
 * @param {{ alg: string, [key: string]: string|number|undefined}} header
 * @param {object} payload payload to sign
 * @param {{
 *  expires?: number
 *  secret?: string
 *  key?: string | Buffer | crypto.PrivateKeyInput | crypto.JsonWebKeyInput | crypto.KeyObject
 * }} opts
 * @returns {string}
 * - expires: expires in milliseconds
 * - secret: secret for HS256/HS384/HS512
 * - key: private key for RS256/RS384/RS512
 */
export function jwtSign(header: {
    [key: string]: string | number | undefined;
    alg: string;
}, payload: object, opts: {
    expires?: number | undefined;
    secret?: string | undefined;
    key?: string | Buffer | crypto.KeyObject | crypto.PrivateKeyInput | crypto.JsonWebKeyInput | undefined;
}): string;
import * as crypto from 'node:crypto';
