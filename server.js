// require necessary NPM packages
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

// require route files
const catchRoutes = require('./app/routes/catch_routes')
const userRoutes = require('./app/routes/user_routes')

const localDbs = {
  dev: 'mongodb://cpearce31:7981@ds113505.mlab.com:13505/anglers-notes',
  test: 'mongodb://cpearce31:7981@ds013495.mlab.com:13495/anglers-notes-test'
}

// select DB based on whether a test file was executed before `server.js`
const localDb = process.env.TESTENV ? localDbs.test : localDbs.dev

const currentDb = process.env.MONGODB_URI || localDb

// establish database connection
mongoose.Promise = global.Promise
mongoose.connect(currentDb, {
  useMongoClient: true
})

// instantiate express application object
const app = express()

console.log('nodeenv here', app.get('env'))

// define port for API to run on
const port = 4741

// add `bodyParser` middleware which will parse JSON requests into
// JS objects before they reach the route files.
// The method `.use` sets up middleware for the Express application
app.use(bodyParser.json())

// register route files
app.use(catchRoutes)
app.use(userRoutes)

// run API on designated port (4741 in this case)
app.listen(port, () => {
  console.log('listening on port ' + port)
})

module.exports = app
