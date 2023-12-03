import { Server, cookieParser, send, response } from 'veloze'
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
      title: 'RedisStore',
      body: `<p>You have visited this page ${req.session.visits} times</p>`
    })
  )
})

app.listen(3000)
