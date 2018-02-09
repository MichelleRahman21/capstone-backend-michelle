const express = require('express')
// jsonwebtoken docs: https://github.com/auth0/node-jsonwebtoken
const jwt = require('jsonwebtoken')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')
// bcrypt docs: https://github.com/kelektiv/node.bcrypt.js
const bcrypt = require('bcrypt')

// see above for explanation of "salting", 10 rounds is recommended
const bcryptSaltRounds = 10

const handle = require('../../lib/error_handler')

const User = require('../models/user')

// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `res.user`
const requireToken = passport.authenticate('jwt', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// SIGN UP
// POST /sign-up
router.post('/sign-up', (req, res) => {
  // generate a hash from the provided password
  // this returns a promise
  bcrypt.hash(req.body.credentials.password, bcryptSaltRounds)
    .then(hash => {
      // return necessary params to create a user
      return {
        email: req.body.credentials.email,
        hashedPassword: hash
      }
    })
    // create user with provided email and hashed password
    .then(user => User.create(user))
    // send the new user object back with status 201, but `hashedPassword`
    // won't be send because of the `transform` in the User model
    .then(user => res.status(201).json({ user: user.toObject() }))
    // pass any errors along to the error handler
    .catch(err => handle(err, res))
})

// SIGN IN
// POST /sign-in
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
        // if the password didn't match the email, return "401 Unauthorized"
        res.sendStatus(401)
      }
    })
    .catch(err => handle(err, res))
})

// CHANGE password
// PATCH /change-password
router.patch('/change-password', requireToken, (req, res) => {
  let user
  // `req.user` will be determined by decoding the token payload
  User.findById(req.user.id)
    .then(record => {
      user = record
      // return a hash of the new password
      return bcrypt.hash(req.body.passwords.new, bcryptSaltRounds)
    })
    .then(hash => {
      // set and save the new hashed password in the DB
      user.hashedPassword = hash
      return user.save()
    })
    // respond with no content and status 200
    .then(() => res.sendStatus(200))
    // pass any errors along to the error handler
    .catch(err => handle(err, res))
})

router.delete('/sign-out', requireToken, (req, res) => {
  res.sendStatus(204)
})

module.exports = router
