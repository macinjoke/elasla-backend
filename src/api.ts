import express from 'express'

const router = express.Router()

router.get('/some_data', (req, res, next) => {
  res.json({ some_hoge: { A: 'aaaa', B: 'bbbb' } })
})

export default router
