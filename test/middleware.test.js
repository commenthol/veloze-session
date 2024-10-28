import { Server, send, cookieParser, queryParser, utils } from 'veloze'
import assert from 'assert/strict'
import { session } from '../src/index.js'
import { MemoryStore } from '../src/stores/MemoryStore.js'
import supertest from 'supertest'

describe('session middleware', function () {
  let app
  let cookie

  before(() => {
    app = new Server({ gracefulTimeout: 0.1, onlyHTTP1: true })
    app.use(queryParser, cookieParser)
    app.get('/memory', session({ store: new MemoryStore() }), echo)
    app.get(
      '/cookie',
      session({ secrets: [{ kid: '123', secret: 'fartl3k' }] }),
      echo
    )
  })

  describe('memory store', function () {
    it('shall not create session', async function () {
      await supertest(app).get('/memory').expect({ session: {} })
    })

    it('new session', async function () {
      await supertest(app)
        .get('/memory')
        .query({ hello: 'world' })
        .expect({ session: { hello: 'world' } })
        .expect(
          shouldHaveSetCookieHeader([
            { session: true, Path: '/', HttpOnly: true, SameSite: 'Strict' }
          ])
        )
        .then(({ headers }) => {
          cookie = utils.cookieParse(headers['set-cookie'][0])
        })
    })

    it('existing session', async function () {
      const { headers } = await supertest(app)
        .get('/memory')
        .query({ hello: 'world' })
        .expect({ session: { hello: 'world' } })
      cookie = utils.cookieParse(headers['set-cookie'][0])
      await supertest(app)
        .get('/memory')
        .set({ cookie: `session=${cookie.session}` })
        .expect({ session: { hello: 'world' } })
    })
  })

  describe('cookie store', function () {
    it('shall not create session', async function () {
      await supertest(app).get('/cookie').expect({ session: {} })
    })

    it('new session', async function () {
      await supertest(app)
        .get('/cookie')
        .query({ hello: 'world' })
        .expect({ session: { hello: 'world' } })
        .expect(
          shouldHaveSetCookieHeader([
            { session: true, Path: '/', HttpOnly: true, SameSite: 'Strict' }
          ])
        )
    })

    it('existing session', async function () {
      const { headers } = await supertest(app)
        .get('/cookie')
        .query({ hello: 'world' })
        .expect({ session: { hello: 'world' } })
      cookie = utils.cookieParse(headers['set-cookie'][0])
      await supertest(app)
        .get('/cookie')
        .set({ cookie: `session=${cookie.session}` })
        .expect({ session: { hello: 'world' } })
    })
  })
})

const echo = [
  send,
  async (req, res) => {
    const { session, query } = req

    if (Object.keys(query).length) {
      session.set(query)
    }
    // await session.save() // explicitly store session to pass error if session store is not accessible

    // eslint-disable-next-line no-unused-vars
    const { iat, exp, ...other } = session

    res.send({ session: other })
  }
]

export const shouldHaveSetCookieHeader =
  (exp) =>
  ({ headers }) => {
    const setCookie = headers['set-cookie']
    assert.ok(setCookie?.length, 'no set-cookie header found')
    for (let i = 0; i < exp.length; i++) {
      const parsed = utils.cookieParse(setCookie[i])
      Object.entries(exp[i]).forEach(([name, value]) => {
        if (value === true) {
          assert.ok(name in parsed, `${name} not in set-cookie[${i}]`)
        } else if (value === false) {
          assert.ok(!(name in parsed), `${name} not in set-cookie[${i}]`)
        } else {
          assert.equal(parsed[name], value)
        }
      })
    }
  }

export const shouldHaveHeaders =
  (exp) =>
  ({ headers }) => {
    Object.entries(exp).forEach(([header, value]) => {
      if (value instanceof RegExp) {
        assert.ok(
          value.test(headers[header]),
          `${header} ${value} !== ${headers[header]}`
        )
      } else if (typeof value === 'boolean' && value === true) {
        assert.ok(header in headers, `${header} : ${headers[header]}`)
      } else if (typeof value === 'boolean' && value === false) {
        assert.ok(!(header in headers), `${header} : ${headers[header]}`)
      } else {
        assert.strictEqual(headers[header], value)
      }
    })
  }
