/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 */ /**
* @typedef {import('../types.js').Store} Store
*/
/**
 * @extends {Store}
 */
export class SqlStore {
    /**
     * Creates a new MongoDB store.
     *
     * @param {{
     *  client: Sequelize
     *  tableName?: string
     * }} opts store options
     * - client: sequelize client instance
     * - tableName: table name in database default='sessions'
     */
    constructor(opts: {
        client: Sequelize;
        tableName?: string;
    });
    options: {
        client: import("sequelize").Sequelize;
        tableName: string;
    };
    _model: {};
    /**
     * Initialize store
     * @param {{ force?: boolean, alter?: boolean }} [opts] init options
     * - force: force creating table if not exists; default=false
     * - alter: alter table if exists; default=false
     */
    init(opts?: {
        force?: boolean;
        alter?: boolean;
    } | undefined): Promise<void>;
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
export type Sequelize = import("sequelize").Sequelize;
export type Store = import("../types.js").Store;
import { Session } from '../Session.js';
