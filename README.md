[![npm-badge][npm-badge]][npm]
[![actions-badge][actions-badge]][actions]
![types-badge][types-badge]

# @veloze/session

Session middleware for [veloze][]. Works also with [express][]

Comes packed with a

- Cookie store as default (uses [HS256 JWT](https://jwt.io))
- Memory store (not for production)
- Redis store (using [ioredis](https://www.npmjs.com/package/ioredis))
- SQL store (using [sequelize](https://www.npmjs.com/package/sequelize))


**Table of Contents**

<!-- !toc -->

* [Usage](#usage)
  * [MemoryStore](#memorystore)
  * [RedisStore](#redisstore)
  * [MongoStore](#mongostore)
  * [SqlStore](#sqlstore)
* [API](#api)
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

See `./examples/memorystore.js`

<!-- include (./examples/memorystore.js lang=js) -->
```js
import { Server, send, queryParser, cookieParser, response } from 'veloze'
import { session, MemoryStore } from '@veloze/session'
import { view } from './view.js'

const store = new MemoryStore()

const app = new Server({ onlyHTTP1: true })

app.use(
  send,
  queryParser,
  cookieParser,
  // attach session middleware with store
  session({
    store,
    expires: 10,
    initialData: { visits: 0 }
  })
)

//...
```
<!-- /include -->

## RedisStore

Use Redis as session storage

> **Note:** needs additional dependency
> ```sh
> npm i ioredis
> ```

See `./examples/redisstore.js`

<!-- include (./examples/redisstore.js lang=js) -->
```js
import { Server, send, queryParser, cookieParser, response } from 'veloze'
import { session } from '@veloze/session'
import { view } from './view.js'

// import redis driver and store
import Redis from 'ioredis'
import { RedisStore } from '@veloze/session/RedisStore'

// create redis client
const client = new Redis({
  host: '127.0.0.1',
  port: 6379
  // username: '',
  // password: '',
  // db: 0,
  // keyPrefix: 'session:',
})
const store = new RedisStore({ client })

const app = new Server({ onlyHTTP1: true })

app.use(
  send,
  queryParser,
  cookieParser,
  // attach session middleware with store
  session({
    store,
    expires: 10,
    initialData: { visits: 0 }
  })
)

//...
```
<!-- /include -->

## MongoStore

Use MongoDB as session storage

> **Note:** needs additional dependency
> ```sh
> npm i mongodb
> ```

See `./examples/mongostore.js`

<!-- include (./examples/mongostore.js lang=js) -->
```js
import { Server, send, queryParser, cookieParser, response } from 'veloze'
import { session } from '@veloze/session'
import { view } from './view.js'

// import mongo driver and store
import { MongoClient } from 'mongodb'
import { MongoStore } from '@veloze/session/MongoStore'

// create mongo client
const client = new MongoClient('mongodb://root:example@localhost:27017')
const store = new MongoStore({ client })

const app = new Server({ onlyHTTP1: true })

app.use(
  send,
  queryParser,
  cookieParser,
  // attach session middleware with store
  session({
    store,
    expires: 10,
    // extendExpiry: true,
    initialData: { visits: 0 }
  })
)

//...
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

See `./examples/postgresstore.js`

<!-- include (./examples/postgresstore.js lang=js) -->
```js
import { Server, send, queryParser, cookieParser, response } from 'veloze'
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

app.use(
  send,
  queryParser,
  cookieParser,
  // attach session middleware with store
  session({
    store,
    expires: 10,
    // extendExpiry: true,
    initialData: { visits: 0 }
  })
)

//...
```
<!-- /include -->

# API

## Session Middleware

```ts
 function session(opts: {
    /** 
     * session store 
     * @default CookieStore
     */
    store?: import("./types").Store | undefined;
    /**
     * session expiration
     * @default '12 hours'
     */
    expires?: string | number | undefined;
    /**
     * session cookie name
     * @default 'session'
     */
    name?: string | undefined;
    /**
     * Cookie options
     */
    cookieOpts?: import("veloze/types/types.js").CookieOpts | undefined;
    /**
     * if `true` extend expiry on every request
     * @default false
     */
    extendExpiry?: boolean | undefined;
    /**
     * initial session data (if no session found)
     */
    initialData?: object;
    /**
     * signing secrets; 1st used to sign, all others to verify;
     * only required if using default CookieStore
     */
    secrets?: {
        kid: string;
        secret: string;
    }[] | undefined;
    randomId?: (() => string) | undefined;
}): Promise<(req, res, next) => void>;
```


# License

[MIT licensed](./LICENSE)

[npm-badge]: https://badgen.net/npm/v/@veloze/session
[npm]: https://www.npmjs.com/package/@veloze/session
[types-badge]: https://badgen.net/npm/types/@veloze/session
[actions-badge]: https://github.com/commenthol/veloze-session/workflows/CI/badge.svg?branch=main&event=push
[actions]: https://github.com/commenthol/veloze-session/actions/workflows/ci.yml?query=branch%3Amain
[veloze]: https://github.com/commenthol/veloze
[express]: http://expressjs.com/
