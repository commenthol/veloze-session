/**
 * @typedef {import('./types').Store} Store
 */ /**
* @typedef {import('veloze/types').CookieOpts} CookieOpts
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
 * - maxAge: session expiration
 * - name: session cookie name
 * - cookieOpts: cookie options
 * - extendExpiry: extend expiry on every request
 * - initialData: initial session data (if no session found)
 * - secrets[].secret: signing secrets; 1st used to sign, all others to verify
 * - secrets[].kid: keyId to identify the secret from the JWT header
 */
export function session(opts: {
    store?: import("./types").Store | undefined;
    expires?: string | number | undefined;
    name?: string | undefined;
    cookieOpts?: import("veloze/types/types.js").CookieOpts | undefined;
    extendExpiry?: boolean | undefined;
    initialData?: object;
    secrets?: {
        kid: string;
        secret: string;
    }[] | undefined;
    randomId?: (() => string) | undefined;
}): import('veloze/types/types.js').Handler;
export type Store = import('./types').Store;
export type CookieOpts = import('veloze/types').CookieOpts;
