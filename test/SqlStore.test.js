import { dotenv } from '@commenthol/dotconfig'
import assert from 'assert'
import { Session } from '../src/Session.js'
import { nap, isDockerRunning, describeBool } from './support/helper.js'
import { createDatabasePostgres } from './support/sqlCreateDatabase.js'

import { Sequelize } from 'sequelize'
import { SqlStore } from '../src/stores/SqlStore.js'

dotenv.config()

const {
  SQLDB_USER = 'root',
  SQLDB_PASSWORD = 'example',
  SQLDB_HOST = '127.0.0.01',
  SQLDB_PORT = '5432',
  SQLDB_DATABASE = 'test',
  SQLDB_DIALECT = 'postgres'
} = process.env

const user = SQLDB_USER
const password = SQLDB_PASSWORD
const host = SQLDB_HOST
const port = SQLDB_PORT
const database = SQLDB_DATABASE
const dialect = SQLDB_DIALECT

describeBool(isDockerRunning('postgres'))('SqlStore', function () {
  let store
  let client

  before(async function () {
    await createDatabasePostgres({ user, password, host, port, database: 'root' })
    await createDatabasePostgres({ user, password, host, port, database })
  })

  before(async function () {
    client = new Sequelize(database, user, password, {
      logging: false,
      // logging: (...msg) => console.log(msg)
      host,
      port,
      dialect
    })
    store = new SqlStore({ client })
    await store.init({ alter: true })
    await store.clear()
  })
  after(function () {
    client.close()
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
    this.timeout(4000e3)
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
