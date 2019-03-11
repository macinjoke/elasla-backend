import express from 'express'
import { sign } from 'jsonwebtoken'
import passport from 'passport'
import { search } from './elasticsearch'
import { sendMail } from './mail'
import { createUser } from './sqlite'

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
      ...req.user,
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

router.get(
  '/search',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const searchRes = await search('天才')
    res.json({
      sources: searchRes.hits.hits.map((hit: any) => hit._source),
    })
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
