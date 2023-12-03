import { Server, cookieParser, send, response } from 'veloze'
import { session, CookieStore } from '@veloze/session'
import { view } from './view.js'

const app = new Server({ onlyHTTP1: true })

// creates cookie store using HS256 JWT tokens
const store = new CookieStore({ secrets: [{ kid: '1', secret: 'secret' }] })

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
      title: 'CookieStore',
      body: `<p>You have visited this page ${req.session.visits} times</p>`
    })
  )
})

app.listen(3000)
