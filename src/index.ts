import bodyParser from 'body-parser'
import express from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import api from './api'

const app = express()

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
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

app.get('/', (req, res) => res.send('Hello World!'))
app.use('/api', api)

app.post('/login', passport.authenticate('local'), (req, res) => {
  console.log('success authentication')
})

app.post(
  '/api/secure/local',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    res.send('Secure response from ' + JSON.stringify(req.user))
  },
)

app.listen(3000, () => console.log('Listening on 3000...'))
