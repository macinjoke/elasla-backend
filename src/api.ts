import express from 'express'
import { sign } from 'jsonwebtoken'
import passport from 'passport'
import { sendMail } from './mail'
import { createUser } from './sqlite'

const router = express.Router()

router.get('/some_data', (req, res, next) => {
  res.json({ some_hoge: { A: 'aaaa', B: 'bbbb' } })
})

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  (req, res) => {
    console.log(req.user)
    console.log('success authentication')
    res.json({
      username: req.user.username,
      isMailAuthed: Boolean(req.user.isMailAuthed),
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
    res.json(req.user)
  },
)

router.post('/register', async (req, res) => {
  console.log(req.body)
  await sendMail(req.body.username).catch(e => {
    console.log(e)
  })
  const info = await createUser(req.body.username, req.body.password)
  console.log(info)
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
