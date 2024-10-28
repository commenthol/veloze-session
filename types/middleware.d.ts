/**
 * @typedef {import('#types.js').Store} Store
 */ /**
* @typedef {import('veloze').CookieOpts} CookieOpts
*/
/**
 * Session middleware
 *
 * Defaults to Cookie store using HS256 JWT
 *
 * @param {{
 *  store?: Store
 *  expires?: string|number
 *  name?: string
 *  cookieOpts?: CookieOpts
 *  extendExpiry?: boolean
 *  initialData?: object
 *  secrets?: {
 *    kid: string
 *    secret: string
 *  }[]
 *  randomId?: () => string
 * }} opts
 * @returns {import('veloze/types/types.js').Handler}
 * - store: session store
 * - expires: session expiration
 * - name: session cookie name
 * - cookieOpts: cookie options
 * - extendExpiry: if `true` extend expiry on every request
 * - initialData: initial session data (if no session found)
 * - secrets[].secret: signing secrets; 1st used to sign, all others to verify
 * - secrets[].kid: keyId to identify the secret from the JWT header
 */
export function session(opts: {
    store?: Store;
    expires?: string | number;
    name?: string;
    cookieOpts?: CookieOpts;
    extendExpiry?: boolean;
    initialData?: object;
    secrets?: {
        kid: string;
        secret: string;
    }[];
    randomId?: () => string;
}): import("veloze/types/types.js").Handler;
export type Store = import("#types.js").Store;
export type CookieOpts = import("veloze").CookieOpts;
