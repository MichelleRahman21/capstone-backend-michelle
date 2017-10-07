const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const dbConfig = require('./config/db')

mongoose.Promise = global.Promise
mongoose.connect(dbConfig.url, {
  useMongoClient: true
})

const app = express()

const port = 8000

app.use(bodyParser.json())

require('./app/routes/index')(app, mongoose.connection)

app.listen(port, () => {
  console.log('listening on port ' + port)
})
