import * as veloze from 'veloze'
import { CookieStore } from './stores/CookieStore.js'
import { Session } from './Session.js'
import { logger } from './utils/logger.js'

const { isHttpsProto } = veloze.request
const { onWriteHead, setCookie, clearCookie } = veloze.response

const log = logger()

/**
 * @typedef {import('./types').Store} Store
 */ /**
 * @typedef {import('veloze/types').CookieOpts} CookieOpts
 */

/**
 * Session middleware
 *
 * Defaults to Cookie store using HS256 JWT
 *
 * @param {{
 *  store?: Store
 *  expires?: string|number
 *  name?: string
 *  cookieOpts?: CookieOpts
 *  extendExpiry?: boolean
 *  secrets?: {
 *    kid: string
 *    secret: string
 *  }[]
 * }} opts
 * @returns {import('veloze/types/types.js').Handler}
 * - store: session store
 * - maxAge: session expiration
 * - name: session cookie name
 * - cookieOpts: cookie options
 * - extendExpiry: extend expiry on every request
 * - secrets[].secret: signing secrets; 1st used to sign, all others to verify
 * - secrets[].kid: keyId to identify the secret from the JWT header
 */
export function session(opts) {
  const {
    store: _store,
    expires = '12h',
    name = 'session',
    secrets = [],
    cookieOpts = {},
    extendExpiry = false
  } = opts || {}

  const _cookieOpts = { sameSite: 'Strict', ...cookieOpts, httpOnly: true }
  // defaults to cookie store
  const store = _store || new CookieStore({ expires, name, secrets })

  return async function sessionMw(req, res, next) {
    let err = null

    try {
      _cookieOpts.secure = _cookieOpts.secure ?? isHttpsProto(req)

      const sessionId =
        store instanceof CookieStore ? undefined : req.cookies[name]
      let session = new Session(req, { name, sessionId })

      const freshData = await store.get(session)
      session.assign(freshData)

      if (!freshData) {
        // sessionId may be fake, if no data found reset session
        session = new Session(req, { name })
      } else if (session.isExpired()) {
        await store.destroy(session)
      }

      req.session = session.sessionData(store)
      if (extendExpiry) {
        session.extendExpiry()
      }

      onWriteHead(res, () => {
        // all must be synchronous calls!
        if (session.hasChanged) {
          if (session.needsSave) {
            // try to store session
            store.set(session).catch(log.error)
          }
          if (session.cookie) {
            setCookie(res, name, session.cookie, _cookieOpts)
          } else {
            clearCookie(res, name, _cookieOpts)
          }
        }
      })
    } catch (e) {
      clearCookie(res, name, _cookieOpts)
      err = e
    }
    next(err)
  }
}
