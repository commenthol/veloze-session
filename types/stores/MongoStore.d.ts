/**
 * @extends {Store}
 */
export class MongoStore {
    /**
     * Creates a new MongoDB store.
     *
     * @param {{
     *  collection?: string
     *  client?: MongoClient
     *  url?: string
     *  [prop: string]: any
     * }} opts store options
     * - collection: collection name in database default='sessions'
     * - collection: collection name in database default='sessions'
     * - client: optional mongo client instance (all other options are ignored)
     * - url: mongo db connection string
     * - [prop] {MongoClientOptions}: additional options for mongo client
     */
    constructor(opts: {
        [prop: string]: any;
        collection?: string | undefined;
        client?: MongoClient | undefined;
        url?: string | undefined;
    });
    _client: MongoClient;
    _model: import("mongodb").Collection<import("mongodb").Document>;
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
export type MongoClientOptions = import('mongodb').MongoClientOptions;
export type Session = import('../Session.js').Session;
export type Store = import('../types.js').Store;
import { MongoClient } from 'mongodb';
