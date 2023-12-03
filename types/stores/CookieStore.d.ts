/**
 * @typedef {import('../Session.js').Session} Session
 */ /**
* @typedef {import('../types.js').Store} Store
*/
/**
 * @extends {Store}
 */
export class CookieStore {
    /**
     * Creates a Cookie Store.
     *
     * Session values are maintained inside the Cookie.
     *
     * **NOTE:** Ensure that max. Cookie size is below max. allowed HTTP header
     * size in your infrastructure.
     *
     * Some max header sizes of common web servers (including ALL headers and url)
     * - nodejs: 16kB
     * - apache: 8kB
     * - iis: 8kB
     * - tomcat: 8kB
     * - nginx: 4kB
     *
     * @param {{
     *  secrets: {
     *    kid: string
     *    secret: string
     *  }[]
     * }} opts
     *
     * - secrets[].secret: signing secrets; 1st used to sign, all others to verify
     * - secrets[].kid: keyId to identify the secret from the JWT header
     */
    constructor(opts: {
        secrets: {
            kid: string;
            secret: string;
        }[];
    });
    _kid: string | undefined;
    _secret: Uint8Array;
    _kids: {};
    /**
     * Store session with sessionId in store
     * @param {Session} session
     */
    set(session: Session): Promise<void>;
    /**
     * Get session with sessionId
     * @param {Session} session
     * @returns {Promise<object|null>}
     */
    get(session: Session): Promise<object | null>;
    /**
     * Destroy session with sessionId
     * @param {Session} _session
     */
    destroy(_session: Session): Promise<void>;
    /**
     * Get number of active sessions
     *
     * @returns {Promise<number>} is always 1
     */
    size(): Promise<number>;
    /**
     * Clear all sessions
     *
     * Does nothing...
     */
    clear(): Promise<void>;
}
export type Session = import('../Session.js').Session;
export type Store = import('../types.js').Store;
