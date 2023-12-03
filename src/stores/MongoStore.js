import { now } from '../Session.js'

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
  constructor(opts) {
    const {
      database,
      collection = 'sessions',
      client
    } = opts || {}

    this._client = client
    this._model = this._client.db(database).collection(collection)
  }

  /**
   * Initialize store
   */
  async init() {
    await this._model.createIndex({ id: 1 }, { background: true, unique: true })
    await this._model.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
  }

  /**
   * @returns {Promise<void>}
   */
  close() {
    return this._client.close()
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
    if (!id) return
    const expireAt = new Date(exp * 1000)
    await this._model.updateOne(
      { id },
      { $set: { id, data, iat, exp, expireAt } },
      { upsert: true }
    )
  }

  /**
   * Get session with sessionId
   * @param {Session} session
   * @returns {Promise<object|null>}
   */
  async get(session) {
    const { id } = session
    if (!id) return null
    const payload = await this._model.findOne({ id })
    if (!payload) return null
    const { data, iat, exp } = payload
    if (exp < now()) {
      await this.destroy(session)
      return null
    }
    return { data, iat, exp }
  }

  /**
   * Destroy session with sessionId
   * @param {Session} session
   */
  async destroy(session) {
    const { id } = session
    if (!id) return
    await this._model.deleteOne({ id })
  }

  /**
   * Get number of active sessions
   *
   * @returns {Promise<number>}
   */
  size() {
    return this._model.countDocuments({})
  }

  /**
   * Clear all sessions
   */
  async clear() {
    // TODO: implement
    await this._model.deleteMany({})
  }
}
