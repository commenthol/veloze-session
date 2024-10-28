/**
 * @typedef {import('ioredis').Redis} Redis
 */ /**
* @typedef {import('../Session.js').Session} Session
*/ /**
* @typedef {import('../types.js').Store} Store
*/
/**
 * @extends {Store}
 */
export class RedisStore {
    /**
     * Creates a new Redis store.
     *
     * @param {{
     *  client: Redis
     * }} opts store options
     * - client: redis client instance
     */
    constructor(opts: {
        client: Redis;
    });
    _keyPrefix: string;
    _redis: import("ioredis").default;
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
     * @param {Session} session
     */
    destroy(session: Session): Promise<void>;
    /**
     * Get number of active sessions
     *
     * **NOTE:** Don't use very large session sets!
     *
     * @returns {Promise<number>}
     */
    size(): Promise<number>;
    /**
     * Clear all sessions
     *
     * **NOTE:** Don't use very large session sets!
     */
    clear(): Promise<void>;
}
export type Redis = import("ioredis").Redis;
export type Session = import("../Session.js").Session;
export type Store = import("../types.js").Store;
