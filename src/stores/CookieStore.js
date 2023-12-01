import { jwtSign, jwtDecode, verifySignature } from '../utils/index.js'

/**
 * @typedef {import('../Session.js').Session} Session
 */ /**
 * @typedef {import('../types.js').Store} Store
 */

/**
 * @extends {Store}
 */
export class CookieStore {
  /**
   * Creates a Cookie Store.
   *
   * Session values are maintained inside the Cookie.
   *
   * **NOTE:** Ensure that max. Cookie size is below max. allowed HTTP header
   * size in your infrastructure.
   *
   * Some max header sizes of common web servers (including ALL headers and url)
   * - nodejs: 16kB
   * - apache: 8kB
   * - iis: 8kB
   * - tomcat: 8kB
   * - nginx: 4kB
   *
   * @param {{
   *  name: string
   *  secrets: {
   *    kid: string
   *    secret: string
   *  }[]
   *  expires?: string|number
   * }} opts
   *
   * - expires: if string then human time, e.g. 2hours, or if number seconds
   * - name: cookie name
   * - secrets[].secret: signing secrets; 1st used to sign, all others to verify
   * - secrets[].kid: keyId to identify the secret from the JWT header
   */
  constructor(opts) {
    const { secrets } = opts || {}
    if (!Array.isArray(secrets) || !secrets.length) {
      throw TypeError('CookieStore needs a secret')
    }

    // first secret is used to sign, all others to verify
    this._kid = undefined
    this._secret = Uint8Array.from([])
    // map kid to secret
    this._kids = {}

    for (const { kid, secret } of secrets) {
      if (!kid || !secret) {
        throw TypeError('CookieStore needs a secret with kid and secret')
      }
      const secretUint8 = new TextEncoder().encode(secret)
      this._kids[kid] = secretUint8
      if (!this._kid) {
        this._kid = kid
        this._secret = secretUint8
      }
    }
  }

  /**
   * Store session with sessionId in store
   * @param {Session} session
   */
  async set(session) {
    if (!Object.keys(session.data || {}).length) {
      await this.destroy(session)
      return
    }
    const { _kid, _secret } = this
    const { id: sid, iat, exp } = session
    session.cookie = jwtSign(
      { alg: 'HS256', kid: _kid },
      { ...session.data, sid, iat, exp },
      // @ts-expect-error
      { secret: _secret }
    )
  }

  /**
   * Get session with sessionId
   * @param {Session} session
   * @returns {Promise<object|null>}
   */
  async get(session) {
    const jwt = session.getCookie()
    if (!jwt) return null

    const decoded = jwtDecode(jwt)
    const { header, payload } = decoded || {}
    const kid = header?.kid
    if (!kid || !payload) return null

    const secret = this._kids[kid]
    let isValid = false
    try {
      isValid = verifySignature(decoded, { secret })
    } catch (e) {
      // ignore error
    }
    if (!isValid) return null

    const { sid, iat, exp, ...data } = payload
    if (!sid) return null

    return { id: sid, iat, exp, data }
  }

  /**
   * Destroy session with sessionId
   * @param {Session} _session
   */
  async destroy(_session) {
    // do nothing
  }

  /**
   * Get number of active sessions
   *
   * @returns {Promise<number>} is always 1
   */
  async size() {
    return 1
  }

  /**
   * Clear all sessions
   *
   * Does nothing...
   */
  async clear() {}
}
