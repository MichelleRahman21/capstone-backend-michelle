// Include express and passport from node_modules
const express = require('express')
const passport = require('passport')
// include the example model
const Example = require('../models/example')
// include the customErros file so we have access to custom error handling
const customErrors = require('../../lib/custom_errors')
// create variables to hold middleware functions from the customErrors file
// this is just a convienience
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
// include removeBlanks middleware
const removeBlanks = require('../../lib/remove_blank_fields')
// include requireToken middleware
const requireToken = passport.authenticate('bearer', { session: false })
// create an express router
const router = express.Router()

// INDEX
// GET /examples

// 1.use router.get to listen for GET requests made to /examples
// 2. Run the require token middleware
// 3. Run the callback which acts as our controller for this route
router.get('/examples', requireToken, (req, res, next) => {
  // use the example model and call the moongose's find() method
  Example.find()
  // Get the results from the find operation when it completes
    .then(examples => {
      // return the result of mapping over the Mongo documents and converting them to JavScript Objectives
      return examples.map(example => example.toObject())
    })
    // Take our examples as JS objects and send them to the client
    // as JSON with the 200 status code
    .then(examples => res.status(200).json({ examples: examples }))
    // We are cathign the errors and app.use(errorHandler)  will handle that error
    // pass any errors to next
    .catch(next)
})

// SHOW
// GET /examples/5a7db6c74d55bc51bdf39793
router.get('/examples/:id', requireToken, (req, res, next) => {
  Example.findById(req.params.id)
    .then(handle404)
    .then(example => res.status(200).json({ example: example.toObject() }))
    .catch(next)
})

// CREATE
// POST /examples
router.post('/examples', requireToken, (req, res, next) => {
  req.body.example.owner = req.user.id

  Example.create(req.body.example)
    .then(example => {
      res.status(201).json({ example: example.toObject() })
    })
    .catch(next)
})

// UPDATE
// PATCH /examples/5a7db6c74d55bc51bdf39793
router.patch('/examples/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.example.owner

  Example.findById(req.params.id)
    .then(handle404)
    .then(example => {
      requireOwnership(req, example)

      return example.update(req.body.example)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DESTROY
// DELETE /examples/5a7db6c74d55bc51bdf39793
//  Create router for DELETE
// set the URI to collection/:id.
// use requireToken middleware to make sure there is a token
// use our callback as our controller
router.delete('/examples/:id', requireToken, (req, res, next) => {
  // Get the example form the databse that matches the id in the request
  Example.findById(req.params.id)
  // if there is not a matching example return 404
    .then(handle404)
    // if there is a matching example
    .then(example => {
      // Check for ownership
      requireOwnership(req, example)
      // if requireOwnership doees not throw and error delete the example
      example.remove()
    })
    // tell that it worked
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
