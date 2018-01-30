// require necessary NPM packages
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

// require route files
const catchRoutes = require('./app/routes/catch_routes')
const userRoutes = require('./app/routes/user_routes')

// require database configuration logic
// `db` will be the actual Mongo URI as a string
const db = require('./config/db')

// load secret keys for signing tokens from .env
const dotenv = require('dotenv')
dotenv.config()

// select a key based on the current environment
if (process.env.TESTENV) {
  process.env.KEY = process.env.SECRET_KEY_BASE_TEST
} else {
  process.env.KEY = process.env.SECRET_KEY_BASE_DEVELOPMENT
}

// require configured passport authentication middleware
const auth = require('./lib/auth')

// establish database connection
mongoose.Promise = global.Promise
mongoose.connect(db, {
  useMongoClient: true
})

// instantiate express application object
const app = express()

// define port for API to run on
const port = process.env.PORT || 4741

// TEMPORARY DEBUGGER
// app.use((req, res, next) => {
//   console.log('HEADERS HERE', req.headers)
//   next()
// })

// register passport authentication middleware
app.use(auth)

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
