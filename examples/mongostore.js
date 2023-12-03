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
