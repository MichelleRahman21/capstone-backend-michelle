const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

// select DB based on whether a test file was executed before `server.js`
const dbConfig = require('./config/db')
const currentDb = process.env.TESTENV ? dbConfig.test : dbConfig.dev

// establish database connection
mongoose.Promise = global.Promise
mongoose.connect(currentDb, {
  useMongoClient: true
})

const app = express()

const port = 8000

app.use(bodyParser.json())

require('./app/routes/index')(app, mongoose.connection)

module.exports = app.listen(port, () => {
  console.log('listening on port ' + port)
})
