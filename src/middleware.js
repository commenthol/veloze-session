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
 *  initialData?: object
 *  secrets?: {
 *    kid: string
 *    secret: string
 *  }[]
 *  randomId?: () => string
 * }} opts
 * @returns {import('veloze/types/types.js').Handler}
 * - store: session store
 * - expires: session expiration
 * - name: session cookie name
 * - cookieOpts: cookie options
 * - extendExpiry: if `true` extend expiry on every request
 * - initialData: initial session data (if no session found)
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
    initialData = null,
    extendExpiry = false,
    randomId
  } = opts || {}

  const _cookieOpts = { sameSite: 'Strict', ...cookieOpts, httpOnly: true }
  // defaults to cookie store
  const store = _store || new CookieStore({ secrets })

  const isCookieStore = store instanceof CookieStore

  return async function sessionMw(req, res, next) {
    let err = null

    try {
      _cookieOpts.secure = _cookieOpts.secure ?? isHttpsProto(req)

      const sessionId = isCookieStore ? undefined : req.cookies[name]
      const session = new Session(req, {
        name,
        expires,
        sessionId,
        initialData,
        randomId
      })
      const currentCookie = session.getCookie()

      if (sessionId || isCookieStore) {
        const freshData = await store.get(session)
        if (!session.assign(freshData)) {
          // sessionId may be fake, so destroy it
          session.destroy()
        }
      }

      req.session = session.sessionData(store)
      if (extendExpiry) {
        session.extendExpiry()
      }

      onWriteHead(res, () => {
        // all must be synchronous calls!
        if (session.hasChanged) {
          // try to store session
          log.debug('saving session id=%s exp=%s data=%j', session.id, session.exp, session.data)
          store.set(session).catch(log.error)
        }
        if (!session.cookie) {
          if (currentCookie) {
            // only destroy if there was a cookie before
            log.debug('destroying session id=%s', session.id)
            clearCookie(res, name, _cookieOpts)
          }
        } else if (session.cookie !== currentCookie && !session.isEmpty()) {
          log.debug('set cookie=%s', session.cookie)
          setCookie(res, name, session.cookie, _cookieOpts)
        }
      })
    } catch (e) {
      clearCookie(res, name, _cookieOpts)
      err = e
    }
    next(err)
  }
}
