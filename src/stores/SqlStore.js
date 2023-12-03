import { DataTypes } from 'sequelize'
import { Session } from '../Session.js'

/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 *//**
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
  constructor(opts) {
    const { client, tableName = 'sessions' } = opts || {}
    this.options = { client, tableName }
    this._model = {}
  }

  /**
   * Initialize store
   * @param {{ force?: boolean, alter?: boolean }} [opts] init options
   * - force: force creating table if not exists; default=false
   * - alter: alter table if exists; default=false
   */
  async init(opts) {
    const { force = false, alter = false } = opts || {}

    const { client, tableName } = this.options

    await client.authenticate()

    const schema = {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      iat: {
        type: DataTypes.BIGINT
      },
      exp: {
        type: DataTypes.BIGINT
      },
      data: {
        type: DataTypes.JSON
      }
    }

    this._model = client.define('session', schema, {
      indexes: [{ fields: ['id'] }, { fields: ['exp'] }],
      tableName,
      timestamps: false
    })

    await client.sync({ force, alter })
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

    const where = { id }
    const [_foundSession, created] = await this._model.findOrCreate({
      where,
      defaults: { iat, exp, data }
    })
    if (!created) {
      await this._model.update({ iat, exp, data }, { where })
    }
  }

  /**
   * Get session with sessionId
   * @param {Session} session
   * @returns {Promise<object|null>}
   */
  async get(session) {
    const { id } = session
    if (!id) return null
    const where = { id }
    const payload = await this._model.findOne({ where })
    if (!payload) return null
    const data = payload.data
    const iat = Number(payload.iat)
    const exp = Number(payload.exp)
    if (Session.isExpired(exp)) {
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
    const where = { id }
    await this._model.destroy({ where })
  }

  /**
   * Get number of active sessions
   *
   * @returns {Promise<number>}
   */
  size() {
    return this._model.count()
  }

  /**
   * Clear all sessions
   */
  async clear() {
    await this._model.destroy({ where: {} })
  }
}
