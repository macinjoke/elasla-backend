import bodyParser from 'body-parser'
import express from 'express'
import { sign, verify as _verify } from 'jsonwebtoken'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { promisify } from 'util'
import api from './api'

const verify = promisify(_verify)
const app = express()

const secretKey = 'aweiojvcnmcvsadifoweafjewa' // TODO

passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === 'test' && password === 'test') {
      return done(null, username)
    } else {
      return done(null, false)
    }
  }),
)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(passport.initialize())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  )
  next()
})

app.get('/', (req, res) => res.send('Hello World!'))
app.use('/api', api)

app.post(
  '/api/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    console.log(req.body)
    console.log('success authentication')
    res.json({
      ...req.body,
      jwt: sign({ username: req.body.username }, secretKey),
    })
  },
)

app.get('/api/login', async (req: any, res) => {
  const jsonWebToken = req.headers.authorization.split(' ')[1]
  const decoded: any = await verify(jsonWebToken, secretKey).catch(e => {
    res.status(400).json({ error: 'MalformedJWT' })
    return
  })
  console.log('decoded: ' + JSON.stringify(decoded))
  if (!decoded) return
  if (decoded.username === 'test') {
    res.json({
      username: 'test',
      password: 'test',
    })
    return
  }
  res.status(401).json({ error: 'Unauthorized', detail: 'invalid jwt' })
})

app.post(
  '/api/secure/local',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    res.send('Secure response from ' + JSON.stringify(req.user))
  },
)

app.listen(3000, () => console.log('Listening on 3000...'))
