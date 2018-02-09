const express = require('express')
const passport = require('passport')

const handle = require('../../lib/error_handler')
const Example = require('../models/example')

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('jwt', { session: false })

// create
router.post('/examples', requireToken, (req, res) => {
  req.body.example.owner = req.user.id
  Example.create(req.body.example)
    .then(record => {
      res.status(201).json({ example: record.toObject() })
    })
    .catch(err => handle(err, res))
})

// show
router.get('/examples/:id', requireToken, (req, res) => {
  Example.findById(req.params.id)
    .then(record => res.status(200).json({ example: record.toObject() }))
    .catch(err => handle(err, res))
})

// index
router.get('/examples', requireToken, (req, res) => {
  Example.find()
    .then(records => {
      return records.map(record => record.toObject())
    })
    .then(records => res.status(200).json({ examples: records }))
    .catch(err => handle(err, res))
})

// update
router.patch('/examples/:id', requireToken, (req, res) => {
  delete req.body.example.owner // disallow owner reassignment

  Example.findById(req.params.id)
    // Object.assign merges whatever changeds are in req.body
    // into the record found on the previous line
    .then(record => {
      if (!req.user._id.equals(record.owner)) {
        throw new Error({name: 'OwnershipError'})
      }
      return Object.assign(record, req.body.example)
    })
    .then(record => record.save())
    .then(() => res.sendStatus(204))
    .catch(err => handle(err, res))
})

// destroy
router.delete('/examples/:id', requireToken, (req, res) => {
  Example.findById(req.params.id)
    .then(record => {
      if (!req.user._id.equals(record.owner)) {
        throw new Error({name: 'OwnershipError'})
      }
      record.remove()
    })
    .then(() => res.sendStatus(204))
    .catch(err => handle(err, res))
})

module.exports = router
