/**
 * @typedef {import('mongodb').MongoClient} MongoClient
 */ /**
* @typedef {import('../Session.js').Session} Session
*/ /**
* @typedef {import('../types.js').Store} Store
*/
/**
 * @extends {Store}
 */
export class MongoStore {
    /**
     * Creates a new MongoDB store.
     *
     * @param {{
     *  database: string
     *  collection?: string
     *  client: MongoClient
     * }} opts store options
     * - database: database name where sessions are stored
     * - collection: collection name in database default='sessions'
     * - client: mongo client instance
     */
    constructor(opts: {
        database: string;
        collection?: string;
        client: MongoClient;
    });
    _client: import("mongodb").MongoClient;
    _model: import("mongodb").Collection<import("mongodb").Document>;
    /**
     * Initialize store
     */
    init(): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    close(): Promise<void>;
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
     * @returns {Promise<number>}
     */
    size(): Promise<number>;
    /**
     * Clear all sessions
     */
    clear(): Promise<void>;
}
export type MongoClient = import("mongodb").MongoClient;
export type Session = import("../Session.js").Session;
export type Store = import("../types.js").Store;
