import assert from 'assert'
import sinon from 'sinon'
import { CookieStore } from '../src/stores/CookieStore.js'
import { Session } from '../src/Session.js'

describe('CookieStore', function () {
  let store
  before(function () {
    const kid = 'n3v_bfjuS7mleud2'
    const secret = 's3crET'
    store = new CookieStore({
      secrets: [
        { kid, secret },
        { kid: 'aq2rjl2LA4VMmG2mrcRs', secret: 'otherSecret' }
      ]
    })
  })

  let clock
  before(() => {
    clock = sinon.useFakeTimers({ now: new Date('2023-01-01T00:00:00.000Z') })
  })
  after(() => {
    clock.restore()
  })

  let cookie =
    'eyJhbGciOiJIUzI1NiIsImtpZCI6Im4zdl9iZmp1UzdtbGV1ZDIiLCJ0eXAiOiJKV1QifQ.' +
    'eyJ1c2VyIjoidGVzdCIsInNpZCI6IlRYWVUtZVREVEh5QW50bW83QXVHUiIsImlhdCI6MTY3MjUzMTIwMCwiZXhwIjoxNjcyNTc0NDAwfQ.' +
    'DaAInXzwvAFKD4nDDr2APOyen79IOBv2pj1T-JYpkt0'

  it('needs a secret', function () {
    assert.throws(
      () => {
        // eslint-disable-next-line no-new
        new CookieStore()
      },
      {
        name: 'TypeError',
        message: 'CookieStore needs a secret'
      }
    )
  })

  it('secret must have an assigned key id', function () {
    assert.throws(
      () => {
        // eslint-disable-next-line no-new
        new CookieStore({ secrets: ['secret'] })
      },
      {
        name: 'TypeError',
        message: 'CookieStore needs a secret with kid and secret'
      }
    )
  })

  it('shall store session', async function () {
    const req = {}
    const data = { user: 'test' }
    const session = new Session(req, { data, sessionId: 'abcdef' })
    await store.set(session)
    assert.equal(session.hasChanged, false)
    assert.deepEqual(session.data, { user: 'test' })
    cookie = session.cookie
  })

  it('shall get session from cookie', async function () {
    assert.ok(cookie, 'need cookie from previous test')
    const req = { cookies: { session: cookie } }
    const session = new Session(req)
    const { data, iat, exp, id } = await store.get(session)
    assert.deepEqual(data, { user: 'test' })
    assert.equal(iat, 1672531200)
    assert.equal(exp, 1672574400)
    assert.equal(typeof id, 'string')
  })

  it('shall expire session', async function () {
    assert.ok(cookie, 'need cookie from previous test')
    clock.tick(1672574401000 - Date.now())
    const req = { cookies: { session: cookie } }
    const session = new Session(req)
    const payload = await store.get(session)
    assert.equal(payload, null)
    session.assign(payload)
    assert.equal(session.isExpired(), true)
  })
})
