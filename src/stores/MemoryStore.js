/**
 * @typedef {import('../Session.js').Session} Session
 */ /**
 * @typedef {import('../types.js').Store} Store
 */

/**
 * @extends {Store}
 */
export class MemoryStore {
  /**
   * Creates a new Memory store.
   *
   * **NOTE:** Do not use in production if scaling beyond one node instance is
   * required or if you run in cluster mode.
   */
  constructor() {
    this._sessions = new Map()
  }

  /**
   * Store session with sessionId in store
   * @param {Session} session
   */
  async set(session) {
    if (session.isEmpty()) {
      await this.destroy(session)
      return
    }
    const { id, iat, exp, data } = session
    this._sessions.set(id, { data, iat, exp })
  }

  /**
   * Get session with sessionId
   * @param {Session} session
   * @returns {Promise<object|null>}
   */
  async get(session) {
    const payload = this._sessions.get(session.id) || null
    // { iat, exp, data } | any
    return payload
  }

  /**
   * Destroy session with sessionId
   * @param {Session} session
   */
  async destroy(session) {
    this._sessions.delete(session.id)
  }

  /**
   * Get number of active sessions
   *
   * @returns {Promise<number>}
   */
  async size() {
    return this._sessions.size
  }

  /**
   * Clear all sessions
   */
  async clear() {
    this._sessions = new Map()
  }
}
