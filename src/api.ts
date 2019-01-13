import express from 'express'
import { sign, verify as _verify } from 'jsonwebtoken'
import passport from 'passport'
import { promisify } from 'util'

const verify = promisify(_verify)
const router = express.Router()

const secretKey = 'aweiojvcnmcvsadifoweafjewa' // TODO

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
      jwt: sign({ username: req.body.username }, secretKey),
    })
  },
)

router.get('/login', async (req: any, res) => {
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
