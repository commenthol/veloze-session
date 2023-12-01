/**
 * @typedef {import('../Session.js').Session} Session
 */ /**
* @typedef {import('../types.js').Store} Store
*/
/**
 * @extends {Store}
 */
export class MemoryStore {
    _sessions: Map<any, any>;
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
export type Session = import('../Session.js').Session;
export type Store = import('../types.js').Store;
