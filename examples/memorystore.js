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
