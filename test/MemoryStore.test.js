import assert from 'assert'
import sinon from 'sinon'
import { MemoryStore } from '../src/stores/MemoryStore.js'
import { Session } from '../src/Session.js'

describe('MemoryStore', function () {
  let store
  before(function () {
    store = new MemoryStore()
  })

  let clock
  before(() => {
    clock = sinon.useFakeTimers({ now: new Date('2023-01-01T00:00:00.000Z') })
  })
  after(() => {
    clock.restore()
  })

  it('shall store session', async function () {
    const req = {}
    const data = { user: 'test' }
    const session = new Session(req, { data, sessionId: 'abcdef' })
    session.id = 'abc'
    await store.set(session)
    assert.deepEqual(session.data, {
      user: 'test'
    })
  })

  it('shall get session', async function () {
    const req = {}
    const session = new Session(req)
    session.id = 'abc'
    const { data, iat, exp, id } = await store.get(session)
    assert.deepEqual(data, { user: 'test' })
    assert.equal(iat, 1672531200)
    assert.equal(exp, 1672574400)
    assert.equal(typeof id, 'undefined') // shall not contain id
  })

  it('shall obtain expired session', async function () {
    clock.tick(1672574401000 - Date.now())
    const req = {}
    const session = new Session(req)
    session.id = 'abc'
    const payload = await store.get(session)
    session.assign(payload)
    assert.equal(session.isExpired(), true)
  })
})
