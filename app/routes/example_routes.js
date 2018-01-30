const express = require('express')
const passport = require('passport')

const handle = require('../../lib/error_handler')
const Example = require('../models/example')

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
const requireToken = passport.authenticate('jwt', { session: false })

// create
router.post('/examples', requireToken, (req, res) => {
  Example.create(req.body.example)
    .then(record => {
      res.status(201).json({ example: record.toJSON() })
    })
    .catch(err => handle(err, res))
})

// show
router.get('/examples/:id', requireToken, (req, res) => {
  Example.findById(req.params.id)
    .then(record => res.status(200).json({ example: record.toJSON() }))
    .catch(err => handle(err, res))
})

// index
router.get('/examples', requireToken, (req, res) => {
  Example.find()
    .then(records => {
      return records.map(record => record.toJSON())
    })
    .then(records => res.status(200).json({ examples: records }))
    .catch(err => handle(err, res))
})

// update
router.patch('/examples/:id', requireToken, (req, res) => {
  Example.findById(req.params.id)
    .then(record => Object.assign(record, req.body.example))
    .then(record => record.save())
    .then(() => res.sendStatus(204))
    .catch(err => handle(err, res))
})

// destroy
router.delete('/examples/:id', requireToken, (req, res) => {
  Example.findById(req.params.id)
    .then(record => record.remove())
    .then(() => res.sendStatus(204))
    .catch(err => handle(err, res))
})

module.exports = router
