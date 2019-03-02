import { config } from 'dotenv'
config()
import bodyParser from 'body-parser'
import express from 'express'
import passport from 'passport'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import { Strategy as LocalStrategy } from 'passport-local'
import api from './api'
import { getUser, login } from './sqlite'

const app = express()

passport.use(
  new LocalStrategy((username, password, done) => {
    const row = login(username, password)
    if (row) {
      return done(null, username)
    } else {
      return done(null, false)
    }
  }),
)

passport.use(
  new JwtStrategy(
    {
      secretOrKey: process.env.JWT_SECRET_KEY,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    (payload, done) => {
      const row = getUser(payload.username)
      if (row) {
        return done(null, row)
      } else {
        return done(null, false)
      }
    },
  ),
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

app.listen(3000, () => console.log('Listening on 3000...'))
