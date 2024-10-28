import * as veloze from 'veloze'
const { random64, ms } = veloze.utils

/**
 * @typedef {import('#types.js').ReqSession} ReqSession
 */

const EXTEND_EXPIRY = 'extendExpiry'
const DESTROY = 'destroy'
const SAVE = 'save'
const SET = 'set'
const RESET_ID = 'resetId'

export const now = () => Math.floor(Date.now() / 1000)

export class Session {
  static now() {
    return now()
  }

  static isExpired(exp) {
    return typeof exp !== 'number' || isNaN(exp) || exp < now()
  }

  /**
   * @param {Request} req request object
   * @param {{
   *  name?: string
   *  sessionId?: string
   *  expires?: string|number
   *  randomId?: () => string
   *  initialData?: object
   * }} [opts] session options
   * - opts.name: session cookie name (@default 'session')
   * - opts.sessionId: session id
   * - opts.expires: session expiration (@default '12h')
   * - opts.randomId: function to generate session id (@default veloze.utils.random64)
   * - opts.initialData: initial or default session data
   */
  constructor(req, opts) {
    const {
      name = 'session',
      sessionId,
      expires = '12h',
      randomId = random64,
      initialData
    } = opts || {}
    // ts type defs
    this.name = name
    this.req = req
    this._randomId = randomId
    this.id = sessionId || this._randomId()
    this.cookie = this.id
    this.data = {}
    this.initialData = initialData || {}
    this.hasChanged = false
    /** @type {number|undefined} allow setting different expiry */
    this.expires =
      typeof expires === 'number'
        ? ms(expires + 's', true)
        : ms(expires, true) || ms('12h', true)
    this.setExpiry()
  }

  getCookie() {
    // @ts-expect-error // needs cookieParser
    return this.req.cookies[this.name]
  }

  /**
   * @param {object} [data]
   * @returns {boolean} successful set
   */
  set(data) {
    if (!data) {
      // do not overwrite the this.data reference as its needed for the Proxy in
      // sessionData
      for (const key in this.data) {
        Reflect.deleteProperty(this.data, key)
      }
      return true
    }
    if (typeof data !== 'object' || Array.isArray(data)) {
      return false
    }
    Object.assign(this.data, data)
    return true
  }

  /**
   * assign fresh data from store to session
   * @param {{
   *  id?: string
   *  iat?: number
   *  exp?: number
   *  data?: object
   * }|null} freshData
   */
  assign(freshData) {
    if (!freshData || typeof freshData !== 'object') {
      return false
    }

    const { id, iat, exp, data } = freshData
    if (!exp || !isInteger(exp) || exp < now()) {
      return false
    }

    if (id) this.id = id
    if (isInteger(iat)) this.iat = iat
    if (isInteger(exp)) this.exp = exp
    this.set(data)
    this.hasChanged = false
    return true
  }

  /**
   * destroys the session data
   */
  destroy() {
    this.set(null)
    // reset cookie and generate a new session id
    this.id = this._randomId()
    this.cookie = ''
    this.hasChanged = true
  }

  /**
   * resets the session id; leaves the data intact
   */
  resetId() {
    this.cookie = this.id = this._randomId()
    this.hasChanged = true
  }

  /**
   * the session request data
   * @returns {ReqSession}
   */
  sessionData(store) {
    const that = this
    const proxy = new Proxy(this.data, {
      get(obj, prop) {
        switch (prop) {
          case DESTROY:
            return async () => {
              await store.destroy(that)
              that.destroy()
              that.hasChanged = false
            }
          case EXTEND_EXPIRY: {
            return () => {
              that.extendExpiry()
            }
          }
          case SAVE:
            return async () => {
              await store.set(that)
              that.hasChanged = false
            }
          case SET:
            return (data) => {
              if (typeof data !== 'object' || Array.isArray(data)) {
                return
              }
              if (data === null) {
                that.set(null)
                return
              }
              for (const [prop, value] of Object.entries(data)) {
                proxy[prop] = value
              }
            }
          case RESET_ID:
            return async () => {
              await store.destroy(that)
              that.resetId()
              await store.set(that)
              that.hasChanged = false
            }
        }
        return obj[prop] ?? that.initialData[prop]
      },
      set(obj, prop, value) {
        switch (prop) {
          case DESTROY:
          case EXTEND_EXPIRY:
          case SAVE:
          case SET:
          case RESET_ID:
            return false
        }
        if (JSON.stringify(obj[prop]) !== JSON.stringify(value)) {
          if (!that.cookie) {
            // session may have been destroyed previously
            that.cookie = that.id
          }
          that.hasChanged = true
        }
        obj[prop] = value
        return true
      }
    })
    // @ts-expect-error
    return proxy
  }

  /**
   * @returns {boolean} true if empty
   */
  isEmpty() {
    return !Object.keys(this.data || {}).length
  }

  /**
   * sets expiry
   */
  setExpiry() {
    const { iat, exp, expires = 0 } = this
    this.iat = iat ?? now()
    this.exp = exp ?? now() + expires
  }

  /**
   * @returns {boolean} true if expired
   */
  isExpired() {
    const { exp } = this
    return typeof exp === 'number' && exp < now()
  }

  extendExpiry() {
    const { expires = 0 } = this
    this.exp = now() + expires
  }
}

const isInteger = (n) => typeof n === 'number' && Number.isInteger(n)
