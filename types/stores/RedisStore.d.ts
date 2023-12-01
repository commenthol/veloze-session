/**
 * @typedef {import('ioredis').RedisOptions} RedisOptions
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
     *  client?: Redis
     *  host?: string
     *  port?: number
     *  db?: number
     *  username?: string
     *  password?: string
     *  keyPrefix?: string
     *  [prop: string]: any
     * }} opts store options
     * - client: optional redis client instance (all other options are ignored)
     * - host: default='127.0.0.1'
     * - port: default=6379
     * - db: default=0
     * - username: authentication
     * - password: authentication
     * - keyPrefix: default='session'
     * - [prop] {RedisOptions}: additional properties for redis config
     */
    constructor(opts: {
        [prop: string]: any;
        client?: Redis | undefined;
        host?: string | undefined;
        port?: number | undefined;
        db?: number | undefined;
        username?: string | undefined;
        password?: string | undefined;
        keyPrefix?: string | undefined;
    });
    _keyPrefix: string;
    _redis: Redis;
    close(): void;
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
export type RedisOptions = import('ioredis').RedisOptions;
export type Session = import('../Session.js').Session;
export type Store = import('../types.js').Store;
import Redis from 'ioredis';
