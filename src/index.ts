import express from 'express'
import api from './api'

const app = express()

app.get('/', (req, res) => res.send('Hello World!'))
app.use('/api', api)

app.listen(3000, () => console.log('Listening on 3000...'))
