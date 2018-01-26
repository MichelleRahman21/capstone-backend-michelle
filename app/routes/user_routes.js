const express = require('express')
const handle = require('../../lib/error_handler')
const User = require('../models/user')
const bcrypt = require('bcrypt')

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// sign-up
router.post('/sign-up', (req, res) => {
  bcrypt.hash(req.body.credentials.password, 10)
    .then(hash => {
      return {
        email: req.body.credentials.email,
        hashedPassword: hash
      }
    })
    .then(user => User.create(user))
    .then(user => user.toJSON())
    .then(user => res.status(201).json(user))
    .catch(err => handle(err, res))
})

//sign-in
router.post('/sign-in', (req, res) => {
  const user = User.find({ email: req.body.credentials.email })

  bcrypt.compare(req.body.credentials.password, user.hashedPassword)
    .then(correctPassword => {
      if (correctPassword) {
        res.status(201).send('success (this is a placeholder)')
      } else {
        res.status(401)
      }
    })
})

module.exports = router
