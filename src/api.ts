import express from 'express'
import { sign } from 'jsonwebtoken'
import passport from 'passport'

const router = express.Router()

router.get('/some_data', (req, res, next) => {
  res.json({ some_hoge: { A: 'aaaa', B: 'bbbb' } })
})

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    console.log(req.body)
    console.log('success authentication')
    res.json({
      ...req.body,
      jwt: sign(
        { username: req.body.username },
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
    res.json({ username: req.user.username })
  },
)

router.post('/register', (req, res) => {
  console.log(req.body)
  res.json({ ok: true })
})

router.post(
  '/secure/local',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    res.send('Secure response from ' + JSON.stringify(req.user))
  },
)

router.get(
  '/secure/local',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      someSecretData: 'secretttttt',
      user: req.user,
    })
  },
)

export default router
