import express from 'express'
import { sign, TokenExpiredError, verify } from 'jsonwebtoken'
import passport from 'passport'
import { search } from './elasticsearch'
import { sendMail } from './mail'
import { authenticateMail, createUser } from './sqlite'

const router = express.Router()

function generateExpiration(): number {
  if (!process.env.EXPIRATION_TIME) {
    throw Error('set EXPIRATION_TIME environment variable')
  }
  return (
    Math.floor(Date.now() / 1000) + (Number(process.env.EXPIRATION_TIME) || 0)
  )
}

router.get('/some_data', (req, res, next) => {
  res.json({ some_hoge: { A: 'aaaa', B: 'bbbb' } })
})

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    console.log(req.user)
    console.log('login success')
    res.json({
      username: req.user.username,
      isMailAuthed: Boolean(req.user.isMailAuthed),
      jwt: sign(
        {
          username: req.user.username,
          exp: generateExpiration(),
        },
        process.env.JWT_SECRET_KEY || '',
      ),
    })
  },
)

router.get(
  '/login',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    console.log(req.user)
    res.json({
      username: req.user.username,
      isMailAuthed: Boolean(req.user.isMailAuthed),
      jwt: sign(
        {
          username: req.user.username,
          exp: generateExpiration(),
        },
        process.env.JWT_SECRET_KEY || '',
      ),
    })
  },
)

router.post('/register', async (req, res, next) => {
  console.log(req.body)
  try {
    await sendMail(req.body.username)
    const info = await createUser(req.body.username, req.body.password)
    console.log(info)
  } catch (e) {
    next(e)
    return
  }
  res.json({ username: req.body.username, isMailAuthed: false })
})

router.get('/register', (req, res) => {
  console.log(req.body)
  const jwt = req.query.token
  try {
    const data = verify(jwt, process.env.JWT_SECRET_KEY || '') as any
    const info = authenticateMail(data.username)
    console.log(info)
    res.redirect('http://localhost:8080') // TODO
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      res.send(
        '有効期限が切れています。ログインしてメールを送信するか、新規登録をやり直してください', // TODO もう一度おくれるようにする
      )
    }
  }
})

router.get(
  '/search',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    if (!req.query.q) {
      res.status(400).send('q query not found')
      return
    }
    try {
      const searchRes = await search(req.query.q)
      res.json(searchRes.hits.hits.map((hit: any) => hit._source))
    } catch (e) {
      next(e)
    }
  },
)

router.post(
  '/secure/local',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    res.send('Secure response from ' + JSON.stringify(req.user))
  },
)

router.get(
  '/secure/jwt',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      someSecretData: 'secretttttt',
      user: req.user,
    })
  },
)

export default router
