import { deepEqual, equal } from 'assert/strict'
import { Session } from '../src/Session.js'
import { nap } from './helper.js'

describe('Session', function () {
  it('shall not overwrite internal props', function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const data = { value: true }
    const session = new Session(req, { data, sessionId: 'abc' })

    equal(JSON.stringify(session.data), '{"value":true}')
    equal(session.id, 'abc')
    equal(session.cookie, 'abc')
  })

  it('shall manage session data through proxy', function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const data = { step: 1 }
    const session = new Session(req, { data })

    req.session = session.sessionData()
    deepEqual(req.session, { step: 1 })
    equal(session.hasChanged, false)

    session.destroy()
    session.hasChanged = false
    deepEqual(req.session, {})

    req.session.name = 'hi'
    equal(session.hasChanged, true)
    deepEqual(req.session, { name: 'hi' })
  })

  it('shall destroy session through proxy', function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const data = { step: 1 }
    const session = new Session(req, { data })

    req.session = session.sessionData()
    deepEqual(req.session, { step: 1 })
    equal(session.hasChanged, false)

    req.session.destroy()
    equal(session.hasChanged, true)
    equal(session.cookie, '')
  })

  it('shall get cookie', function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const session = new Session(req)
    equal(session.getCookie(), 'hi')
  })

  it('shall extend expiry', async function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const session = new Session(req)
    req.session = session.sessionData()
    const oldExp = session.exp
    await nap(1000)
    req.session.extendExpiry()
    equal(session.exp > oldExp, true)
  })

  it('shall set expires in seconds', function () {
    const session = new Session({}, { expires: 100 })
    equal(session.expires, 100)
  })

  it('shall save session', async function () {
    const req = { url: '/', cookies: {} }
    const session = new Session(req)
    const store = {
      set: async () => {
        store._set = true
      }
    }
    req.session = session.sessionData(store)
    req.session.name = 'hi'
    equal(session.needsSave, true)
    await req.session.save()
    equal(session.needsSave, false)
  })

  it('shall clear session data', async function () {
    const req = { url: '/', cookies: {} }
    const session = new Session(req, { data: { name: 'hi' } })
    const store = {
      set: async () => {}
    }
    deepEqual(session.data, { name: 'hi' })
    req.session = session.sessionData(store)
    req.session.set(null)
    deepEqual(session.data, {})

    req.session.set(1)
    deepEqual(session.data, {})

    req.session.set({ hi: 'name' })
    deepEqual(session.data, { hi: 'name' })
  })

  ;['destroy', 'extendExpiry', 'save', 'set'].forEach((prop) => {
    it(`shall not set ${prop}`, function () {
      const req = { url: '/', cookies: {} }
      const session = new Session(req)
      req.session = session.sessionData()
      try {
        req.session[prop] = 'bad'
        throw new Error('fail')
      } catch (e) {
        equal(
          /on proxy: trap returned falsish for property/.test(e.message),
          true
        )
      }
    })
  })
})
