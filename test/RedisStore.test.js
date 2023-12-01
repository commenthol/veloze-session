import assert from 'assert'
import { RedisStore } from '../src/stores/RedisStore.js'
import { Session } from '../src/Session.js'
import { nap } from './helper.js'

describe('RedisStore', function () {
  let store
  before(async function () {
    store = new RedisStore()
    await store.clear()
  })
  after(function () {
    store.close()
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
    await nap(2000)
    const req = {}
    const session = new Session(req)
    session.id = 'abc'
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
