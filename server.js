// require necessary NPM packages
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

// require route files
const catchRoutes = require('./app/routes/catch_routes')
const userRoutes = require('./app/routes/user_routes')
const db = require('./config/db')

// establish database connection
mongoose.Promise = global.Promise
mongoose.connect(db, {
  useMongoClient: true
})

// instantiate express application object
const app = express()

// define port for API to run on
const port = process.env.PORT || 4741

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
