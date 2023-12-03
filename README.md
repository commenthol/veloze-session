[![npm-badge][npm-badge]][npm]
[![actions-badge][actions-badge]][actions]
![types-badge][types-badge]

# @veloze/session

Session middleware for [veloze][]. Works also with [express][]

Comes packed with a

- Cookie store as default (uses [HS256 JWT](https://jwt.io))
- Memory store (not for production)
- Redis store (using [ioredis](https://www.npmjs.com/package/ioredis))

**Table of Contents**

<!-- !toc -->

* [@veloze/session](#velozesession)
* [Usage](#usage)
  * [MemoryStore](#memorystore)
  * [RedisStore](#redisstore)
  * [MongoStore](#mongostore)
  * [SqlStore](#sqlstore)
* [for postgres](#for-postgres)
* [for mariadb, mysql](#for-mariadb-mysql)
* [License](#license)

<!-- toc! -->

# Usage

Installation

```
npm i @veloze/session
```

In your code:

```js
import { Server, cookieParser } from 'veloze'
import { session } from '@veloze/session'
import { CookieStore } from '@veloze/session/CookieStore'

const app = new Server()

// using Cookie store
app.use(
  cookieParser,
  session({
    store: new CookieStore({
      // allows key rotation (1st secret is used for signing)
      secrets: [
        { kid: '2', secret: 's€cr3t'}, 
        { kid: '1', secret: 'older-s€cr3t'}
      ]
    }),
    // session cookie name
    name: 'session',
    // session expiry
    expires: '12 hours',
    // cookie options
    cookieOpts: { sameSite: 'Strict', httpOnly: true }
  }),
  async (req, res) => {
    // get session data
    const data = req.session
    // save the session
    await req.session.save()
  }
)
```

## MemoryStore

Using Memory store

> **Note:** Do not use in production.

<!-- include (./examples/memorystore.js lang=js) -->
```js
import { Server, cookieParser, send, response } from 'veloze'
import { session, MemoryStore } from '@veloze/session'
import { view } from './view.js'

const store = new MemoryStore()

const app = new Server({ onlyHTTP1: true })

app.use(send, cookieParser, session({ store }))

app.get('/favicon.ico', (req, res) => res.end())

app.get('/', (req, res) => {
  req.session.set({ visits: 0 })
  response.redirect(res, '/visits')
})

app.get('/visits', (req, res) => {
  req.session.visits++
  res.send(
    view({
      title: 'MemoryStore',
      body: `
        <p style="border: 1px solid red; color: red;">Do not use MemoryStore in production!</p>
        <p>You have visited this page ${req.session.visits} times</p>`
    })
  )
})

app.listen(3000)
```
<!-- /include -->

## RedisStore

Use Redis as session storage

> **Note:** needs additional dependency
> ```sh
> npm i ioredis
> ```

include (./examples/redisstore.js lang=js)


## MongoStore

Use MongoDB as session storage

> **Note:** needs additional dependency
> ```sh
> npm i mongodb
> ```

<!-- include (./examples/mongostore.js lang=js) -->
```js
import { Server, cookieParser, send, response } from 'veloze'
import { session } from '@veloze/session'
import { view } from './view.js'

// import mongo driver and store
import { MongoClient } from 'mongodb'
import { MongoStore } from '@veloze/session/MongoStore'

// create mongo client
const client = new MongoClient('mongodb://root:example@localhost:27017')
const store = new MongoStore({ client })

const app = new Server({ onlyHTTP1: true })

// attach session middleware with store
app.use(send, cookieParser, session({ store, data: { visits: 0 } }))

app.get('/favicon.ico', (req, res) => res.end())

app.get('/', (req, res) => {
  req.session.set({ visits: 0 })
  response.redirect(res, '/visits')
})

app.get('/visits', (req, res) => {
  req.session.visits++
  res.send(
    view({
      title: 'MongoStore',
      body: `<p>You have visited this page ${req.session.visits} times</p>`
    })
  )
})

app.listen(3000)
```
<!-- /include -->

## SqlStore

Use Sequelize to connect to your favorite SQL Database

> **Note:** needs additional dependency
> ```sh
> # for postgres
> npm i pg
> # for mariadb, mysql
> npm i mysql2
> ```

<!-- include (./examples/postgresstore.js lang=js) -->
```js
import { Server, cookieParser, send, response } from 'veloze'
import { session } from '@veloze/session'
import { view } from './view.js'

// import sequelize and store
import { Sequelize } from 'sequelize'
import { SqlStore } from '@veloze/session/SqlStore'

/**
 * Create database in PostgreSQL first
 * connect to "postgres" database and run:
 * ```sql
 * CREATE DATABASE test;
 * ```
 */

// creates postgres client
const client = new Sequelize({
  dialect: 'postgres', // don't forget to install "pg"
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: 'example',
  database: 'test',
  logging: false
})
const store = new SqlStore({ client })
await store.init({ alter: true })

const app = new Server({ onlyHTTP1: true })

// attach session middleware with store
app.use(send, cookieParser, session({ store, data: { visits: 0 } }))

app.get('/favicon.ico', (req, res) => res.end())

app.get('/', (req, res) => {
  req.session.set({ visits: 0 })
  response.redirect(res, '/visits')
})

app.get('/visits', (req, res) => {
  req.session.visits++
  res.send(
    view({
      title: 'SqlStore (postgres)',
      body: `<p>You have visited this page ${req.session.visits} times</p>`
    })
  )
})

app.listen(3000)
```
<!-- /include -->

# License

[MIT licensed](./LICENSE)

[npm-badge]: https://badgen.net/npm/v/@veloze/session
[npm]: https://www.npmjs.com/package/@veloze/session
[types-badge]: https://badgen.net/npm/types/@veloze/session
[actions-badge]: https://github.com/commenthol/veloze-session/workflows/CI/badge.svg?branch=main&event=push
[actions]: https://github.com/commenthol/veloze-session/actions/workflows/ci.yml?query=branch%3Amain
[veloze]: https://github.com/commenthol/veloze
[express]: http://expressjs.com/
