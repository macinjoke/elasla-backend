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
  new LocalStrategy(async (username, password, done) => {
    const row = await login(username, password)
    if (row) {
      return done(null, row)
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

// デバッグ用にレスポンスにディレイを与える
app.use((req, res, next) => {
  setTimeout(next, Number(process.env.RESPONSE_DELAY))
})

app.get('/', (req, res) => res.send('Hello World!'))
app.use('/api', api)

app.listen(process.env.PORT, () =>
  console.log(`Listening on ${process.env.PORT}...`),
)
