const express = require('express')
const passport = require('passport')

const handle = require('../../lib/error_handler')
const Catch = require('../models/catch')

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
const requireToken = passport.authenticate('jwt', { session: false })

// create
router.post('/catches', requireToken, (req, res) => {
  Catch.create(req.body.catch)
    .then(record => {
      res.status(201).json({ catch: record.toJSON() })
    })
    .catch(err => handle(err, res))
})

// show
router.get('/catches/:id', requireToken, (req, res) => {
  Catch.findById(req.params.id)
    .then(record => res.status(200).json({ catch: record.toJSON() }))
    .catch(err => handle(err, res))
})

// index
router.get('/catches', requireToken, (req, res) => {
  Catch.find()
    .then(records => {
      return records.map(record => record.toJSON())
    })
    .then(records => res.status(200).json({ catches: records }))
    .catch(err => handle(err, res))
})

// update
router.patch('/catches/:id', requireToken, (req, res) => {
  Catch.findById(req.params.id)
    .then(record => Object.assign(record, req.body.catch))
    .then(record => record.save())
    .then(() => res.sendStatus(204))
    .catch(err => handle(err, res))
})

// destroy
router.delete('/catches/:id', requireToken, (req, res) => {
  Catch.findById(req.params.id)
    .then(record => record.remove())
    .then(() => res.sendStatus(204))
    .catch(err => handle(err, res))
})

module.exports = router
