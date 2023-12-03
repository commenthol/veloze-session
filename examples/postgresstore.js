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
