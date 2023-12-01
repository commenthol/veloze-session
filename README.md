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

Using Memory store

```js
import { Server, cookieParser } from 'veloze'
import { session } from '@veloze/session'
import { MemoryStore } from '@veloze/session/MemoryStore'

const app = new Server()

// using default Cookie store
app.use(
  cookieParser,
  session({
    store: new MemoryStore()
  })
)
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
