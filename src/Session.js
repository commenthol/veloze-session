import * as veloze from 'veloze'
const { random64, ms } = veloze.utils

const EXTEND_EXPIRY = 'extendExpiry'
const DESTROY = 'destroy'
const SAVE = 'save'
const SET = 'set'

export const now = () => Math.floor(Date.now() / 1000)

export class Session {
  /**
   * @param {Request} req request object
   * @param {{
   *  name?: string
   *  sessionId?: string
   *  expires?: string|number
   *  randomId?: () => string
   *  data?: object
   * }} [opts] session options
   * - opts.name: session cookie name (@default 'session')
   * - opts.sessionId: session id
   * - opts.expires: session expiration (@default '12h')
   * - opts.randomId: function to generate session id (@default veloze.utils.random64)
   * - opts.data: initial session data
   */
  constructor(req, opts) {
    const {
      name = 'session',
      sessionId,
      expires = '12h',
      randomId = random64,
      data
    } = opts || {}
    // ts type defs
    this.name = name
    this.req = req
    this.id = sessionId || randomId()
    this.cookie = this.id
    this.data = data || {}
    this.hasChanged = false
    this.needsSave = true
    /** @type {number|undefined} allow setting different expiry */
    this.expires =
      typeof expires === 'number'
        ? ms(expires + 's', true)
        : ms(expires, true) || ms('12h', true)
    this.setExpired()
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

  assign(freshData) {
    if (!freshData || typeof freshData !== 'object') {
      this.exp = now() - 60
      return
    }

    const { id, iat, exp, data } = freshData
    if (id) this.id = id
    this.iat = iat
    this.exp = exp
    this.set(data)
  }

  /**
   * destroys the session data
   */
  destroy() {
    this.set(null)
    // reset cookie and generate a new session id
    this.id = random64()
    this.cookie = ''
    this.hasChanged = true
  }

  /**
   * the session request data
   * @returns {object}
   */
  sessionData(store) {
    const that = this
    const proxy = new Proxy(this.data, {
      get(obj, prop) {
        switch (prop) {
          case DESTROY:
            return () => {
              that.destroy()
            }
          case EXTEND_EXPIRY: {
            return () => {
              that.extendExpiry()
            }
          }
          case SAVE:
            return async () => {
              await store.set(that)
              that.needsSave = false
            }
          case SET:
            return (data) => {
              if (typeof data !== 'object' || Array.isArray(data)) {
                return
              }
              if (data === null) {
                that.destroy()
                return
              }
              for (const [prop, value] of Object.entries(data)) {
                proxy[prop] = value
              }
            }
        }
        return obj[prop]
      },
      set(obj, prop, value) {
        switch (prop) {
          case DESTROY:
          case EXTEND_EXPIRY:
          case SAVE:
          case SET:
            return false
        }
        if (JSON.stringify(obj[prop]) !== JSON.stringify(value)) {
          that.hasChanged = true
          that.needsSave = true
        }
        obj[prop] = value
        return true
      }
    })
    return proxy
  }

  /**
   * sets expiry
   */
  setExpired() {
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
