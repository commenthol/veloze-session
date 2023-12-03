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
  constructor(opts) {
    const {
      client
    } = opts || {}

    if (!client.options.keyPrefix) {
      client.options.keyPrefix = 'session:'
    }

    this._keyPrefix = client.options.keyPrefix
    this._redis = client
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
    await this._redis
      .pipeline()
      .set(id, JSON.stringify({ iat, exp, data }))
      .expireat(id, exp)
      .exec()
  }

  /**
   * Get session with sessionId
   * @param {Session} session
   * @returns {Promise<object|null>}
   */
  async get(session) {
    const dataStr = await this._redis.get(session.id)
    return dataStr ? JSON.parse(dataStr) : null
  }

  /**
   * Destroy session with sessionId
   * @param {Session} session
   */
  async destroy(session) {
    await this._redis.del(session.id)
  }

  /**
   * Get number of active sessions
   *
   * **NOTE:** Don't use very large session sets!
   *
   * @returns {Promise<number>}
   */
  async size() {
    const keys = await this._redis.keys(`${this._keyPrefix}*`)
    return keys?.length || 0
  }

  /**
   * Clear all sessions
   *
   * **NOTE:** Don't use very large session sets!
   */
  async clear() {
    const keys = await this._redis.keys(`${this._keyPrefix}*`)
    if (keys?.length) {
      // need to strip keyPrefix as del prepends prefix but keys does not...
      const keyPrefixLen = this._keyPrefix.length
      const _keys = keys.map((key) => key.slice(keyPrefixLen))
      await this._redis.del(..._keys)
    }
  }
}
