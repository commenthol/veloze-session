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

app.get('/favicon.ico', (req, res) => res.end())

app.get('/', (req, res) => {
  if (!req.query.novisit) {
    req.session.visits++
  }
  res.send(
    view({
      title: 'MongoStore',
      body: `<p>You have visited this page ${req.session.visits} times</p>`
    })
  )
})

app.get('/destroy', async (req, res) => {
  await req.session.destroy()
  response.redirect(res, '/')
})

app.get('/reset-id', async (req, res) => {
  await req.session.resetId()
  response.redirect(res, '/')
})

app.listen(3000)
