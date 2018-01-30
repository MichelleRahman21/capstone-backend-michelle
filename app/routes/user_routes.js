const express = require('express')
const handle = require('../../lib/error_handler')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// sign-up
router.post('/sign-up', (req, res) => {
  // asynchronously generate a hash from the provided password
  bcrypt.hash(req.body.credentials.password, 10)
    .then(hash => {
      // pass a (hopefully) valid user object into the next `.then`
      return {
        email: req.body.credentials.email,
        hashedPassword: hash
      }
    })
    .then(user => User.create(user))
    .then(user => user.toObject())
    .then(user => res.status(201).json({user}))
    .catch(err => handle(err, res))
})

// sign-in
router.post('/sign-in', (req, res) => {
  const pw = req.body.credentials.password

  // find a user based on the email that was passed
  User.findOne({ email: req.body.credentials.email })
    .then(user => {
      return {
        // `bcrypt.compare` will return true if the result of hashing `pw`
        // is exactly equal to the hashed password stored in the DB
        correctPassword: bcrypt.compare(pw, user.hashedPassword),
        user
      }
    })
    .then(data => {
      // if the passwords matched
      if (data.correctPassword) {
        // we will encode the user ID in each token, so we know who the token
        // belongs to. This is the "payload"
        const payload = { id: data.user.id }
        // generate a token that lasts 1 hour by encrypting the payload and
        // signing it with the secret key from `.env`
        const token = jwt.sign(payload, process.env.KEY, { expiresIn: '1h' })
        // return status 201, the email, and the new token
        res.status(201).json({
          email: data.user.email,
          token
        })
      } else {
        res.sendStatus(401)
      }
    })
    .catch(err => handle(err, res))
})

// this is the same `authenticate` function we use in resource routes
// that need to be authenticated
const requireToken = passport.authenticate('jwt', { session: false })

// change-password
router.patch('/change-password', requireToken, (req, res) => {
  let user
  // `req.user` will be determined by decoding the token payload
  User.findById(req.user.id)
    .then(record => {
      user = record
      // send a hash of the new password to the next `.then`
      return bcrypt.hash(req.body.passwords.new, 10)
    })
    .then(hash => {
      user.hashedPassword = hash
      // save the new hashed password in the DB
      return user.save()
    })
    .then(() => res.sendStatus(200))
    .catch(err => handle(err, res))
})

module.exports = router
