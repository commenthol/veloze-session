import assert from 'assert'
import { RedisStore } from '../src/stores/RedisStore.js'
import { Session } from '../src/Session.js'
import { nap, isDockerRunning, describeBool } from './support/helper.js'
import Redis from 'ioredis'

describeBool(isDockerRunning('redis'))('RedisStore', function () {
  let store
  let client
  before(async function () {
    client = new Redis({
      host: '127.0.0.1',
      port: 6379
      // db: 0
      // keyPrefix: 'session:'
      // username: '',
      // password: '',
    })

    store = new RedisStore({ client })
    await store.clear()
  })
  after(function () {
    client.disconnect()
  })

  it('shall store session', async function () {
    const req = {}
    const session = new Session(req, { sessionId: 'abc', expires: 1 })
    session.set({ user: 'test' })
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
    const session = new Session(req, { expires: 1 })
    session.set({ test: 'expires' })
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
    const req = {}
    for (let i = 0; i < 10; i++) {
      const session = new Session(req)
      session.set({ i })
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
