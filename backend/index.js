const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

app.use(cors())
app.use(express.json())

const authController = require('./controllers/authController')
const mainController = require('./controllers/mainController')

app.use(authController)
app.use(mainController)

app.listen(5000, () => console.log('server running'))

mongoose.connect(process.env.MONGODB_CONNECTION_URL)
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log(err))