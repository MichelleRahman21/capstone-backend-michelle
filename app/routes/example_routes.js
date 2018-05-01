const express = require('express')
const passport = require('passport')

const Example = require('../models/example')

const handle = require('../../lib/error_handler')
const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

router.get('/examples', requireToken, (req, res) => {
  Example.find()
    .then(examples => {
      return examples.map(example => example.toObject())
    })
    .then(examples => res.status(200).json({ examples: examples }))
    .catch(err => handle(err, res))
})

router.get('/examples/:id', requireToken, (req, res) => {
  Example.findById(req.params.id)
    .then(handle404)
    .then(example => res.status(200).json({ example: example.toObject() }))
    .catch(err => handle(err, res))
})

router.post('/examples', requireToken, (req, res) => {
  req.body.example.owner = req.user.id

  Example.create(req.body.example)
    .then(example => {
      res.status(201).json({ example: example.toObject() })
    })
    .catch(err => handle(err, res))
})

router.patch('/examples/:id', requireToken, (req, res) => {
  delete req.body.example.owner

  Example.findById(req.params.id)
    .then(handle404)
    .then(example => {
      requireOwnership(req, example)

      Object.keys(req.body.example).forEach(key => {
        if (req.body.example[key] === '') {
          delete req.body.example[key]
        }
      })

      return example.update(req.body.example)
    })
    .then(() => res.sendStatus(204))
    .catch(err => handle(err, res))
})

router.delete('/examples/:id', requireToken, (req, res) => {
  Example.findById(req.params.id)
    .then(handle404)
    .then(example => {
      requireOwnership(req, example)
      example.remove()
    })
    .then(() => res.sendStatus(204))
    .catch(err => handle(err, res))
})

module.exports = router
