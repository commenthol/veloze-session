import { deepEqual, equal } from 'assert/strict'
import { MemoryStore } from '../src/stores/MemoryStore.js'
import { Session } from '../src/Session.js'
import { nap } from './support/helper.js'

describe('Session', function () {
  it('shall not overwrite internal props', function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const session = new Session(req, { sessionId: 'abc' })
    session.set({ value: true })
    equal(JSON.stringify(session.data), '{"value":true}')
    equal(session.id, 'abc')
    equal(session.cookie, 'abc')
  })

  it('shall set session data', function () {
    const req = { url: '/' }
    const session = new Session(req)
    session.set({ name: 'hi' })
    deepEqual(session.data, { name: 'hi' })
  })

  it('cant set array as session data', function () {
    const req = { url: '/' }
    const session = new Session(req)
    session.set(['hi'])
    deepEqual(session.data, {})
  })

  it('cant set string as session data', function () {
    const req = { url: '/' }
    const session = new Session(req)
    session.set('hi')
    deepEqual(session.data, {})
  })

  it('shall clear all session data', function () {
    const req = { url: '/' }
    const session = new Session(req)
    session.set({ name: 'hi', one: 1 })
    deepEqual(session.data, { name: 'hi', one: 1 })
    session.set(null)
    deepEqual(session.data, {})
  })

  it('shall assign fresh session data', function () {
    const req = { url: '/' }
    const session = new Session(req)
    deepEqual(session.data, {})
    const iat = Session.now() - 1
    const exp = Session.now() + 1
    equal(session.assign({ iat, exp, data: { one: 1 } }), true)
    equal(session.iat, iat)
    equal(session.exp, exp)
    deepEqual(session.data, { one: 1 })
  })

  it('shall expire session if no fresh data was provided', function () {
    const req = { url: '/' }
    const session = new Session(req)
    equal(session.assign(null), false)
  })

  it('shall not assign expired session data', function () {
    const req = { url: '/' }
    const session = new Session(req)
    session.exp = session.iat = 0
    deepEqual(session.data, {})
    const iat = Session.now() - 2
    const exp = Session.now() - 1
    equal(session.assign({ iat, exp, data: { one: 1 } }), false)
    equal(session.iat, 0)
    equal(session.exp, 0)
    equal(session.isEmpty(), true)
    deepEqual(session.data, {})
  })

  it('shall manage session data through proxy', function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const initialData = { step: 1 }
    const session = new Session(req, { initialData })

    req.session = session.sessionData()
    // shall return initial data
    equal(req.session.step, 1)
    equal(session.hasChanged, false)

    session.destroy()
    session.hasChanged = false
    deepEqual(req.session, {})

    req.session.name = 'hi'
    equal(session.hasChanged, true)
    deepEqual(req.session, { name: 'hi' })
  })

  it('shall destroy session through proxy', async function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const initialData = { step: 1 }
    const session = new Session(req, { initialData })

    req.session = session.sessionData(new MockStore())
    equal(req.session.step, 1)
    equal(session.hasChanged, false)

    await req.session.destroy()
    equal(session.hasChanged, false)
    equal(session.cookie, '')
  })

  it('shall get cookie', function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const session = new Session(req)
    equal(session.getCookie(), 'hi')
  })

  it('shall extend expiry', async function () {
    const req = { url: '/', cookies: { session: 'hi' } }
    const expires = 10
    const session = new Session(req, { expires })
    req.session = session.sessionData(new MockStore())
    const oldExp = session.exp
    await nap(1000)
    req.session.extendExpiry()
    equal(session.exp, oldExp + 1)
  })

  it('shall set expires in seconds', function () {
    const session = new Session({}, { expires: 100 })
    equal(session.expires, 100)
  })

  it('shall save session', async function () {
    const req = { url: '/', cookies: {} }
    const session = new Session(req)
    const store = new MockStore()
    req.session = session.sessionData(store)
    req.session.name = 'hi'
    await req.session.save()
  })

  it('shall reset session', async function () {
    const req = { url: '/', cookies: {} }
    const session = new Session(req, { data: { name: 'hi' } })
    const store = new MemoryStore()
    req.session = session.sessionData(store)
    const lastId = session.id
    const lastData = { ...session.data }
    await req.session.resetId()
    equal(session.id !== lastId, true)
    deepEqual(session.data, lastData)
  })

  it('shall clear session data', async function () {
    const req = { url: '/', cookies: {} }
    const session = new Session(req)
    session.set({ name: 'hi' })
    const store = new MockStore()

    req.session = session.sessionData(store)
    equal(req.session.name, 'hi')
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

class MockStore {
  constructor() {
    this._set = null
  }

  async set(session) {
    const { id, iat, exp, data } = session
    this._set = { id, iat, exp, data: structuredClone(data) }
  }

  async get(_session) {
    return null
  }

  async destroy(_session) {}
}
