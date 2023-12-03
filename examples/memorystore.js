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
      title: 'MemoryStore',
      body: `
        <p style="border: 1px solid red; color: red;">Do not use MemoryStore in production!</p>
        <p>You have visited this page ${req.session.visits} times</p>`
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
