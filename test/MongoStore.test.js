import assert from 'assert'
import { MongoStore } from '../src/stores/MongoStore.js'
import { Session } from '../src/Session.js'
import { nap } from './helper.js'

describe('MongoStore', function () {
  let store
  before(async function () {
    store = new MongoStore({
      database: 'test',
      url: 'mongodb://root:example@localhost:27017'
    })
    await store.clear()
  })
  after(async function () {
    await store.close()
  })

  it('shall store session', async function () {
    const req = {}
    const data = { user: 'test' }
    const session = new Session(req, { data, sessionId: 'abc', expires: 1 })
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
    assert.equal(typeof iat, 'number')
    assert.equal(typeof exp, 'number')
    assert.equal(typeof id, 'undefined') // shall not contain id
  })

  it('shall get session size', async function () {
    const size = await store.size()
    assert.equal(size, 1)
  })

  it('shall destroy expired session', async function () {
    this.timeout(4000)
    const req = {}
    const data = { test: 'expires' }
    const session = new Session(req, { data, expires: 1 })
    session.id = 'expires'
    await store.set(session)
    await nap(100)
    {
      const payload = await store.get(session)
      assert.notEqual(payload, null)
    }
    await nap(2000)
    const payload = await store.get(session)
    assert.equal(payload, null)
  })

  it('shall destroy session', async function () {
    const req = {}
    const session = new Session(req, { data: { test: 'it' } })
    session.id = 'def'
    await store.set(session)
    await store.destroy(session)
    const session1 = new Session(req)
    session1.id = 'def'
    const payload = await store.get(session1)
    assert.equal(payload, null)
  })

  it('shall clear all sessions', async function () {
    await store.clear()
    const req = {}
    for (let i = 0; i < 10; i++) {
      const session = new Session(req, { data: { i } })
      await store.set(session)
    }
    {
      const size = await store.size()
      assert.equal(size, 10)
    }
    await nap(100)
    await store.clear()
    {
      const size = await store.size()
      assert.equal(size, 0)
    }
  })
})
