import Redis from 'ioredis'

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
  constructor(opts) {
    const {
      client,
      host = '127.0.0.1',
      port = 6379,
      db = 0,
      username,
      password,
      keyPrefix = 'session:',
      /** @type {RedisOptions} */
      ...redisOpts
    } = opts || {}
    this._keyPrefix = keyPrefix
    this._redis =
      client ||
      new Redis({
        host,
        port,
        db,
        username,
        password,
        keyPrefix,
        ...redisOpts
      })
  }

  close() {
    this._redis.disconnect()
  }

  /**
   * Store session with sessionId in store
   * @param {Session} session
   */
  async set(session) {
    session.setExpired()
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
