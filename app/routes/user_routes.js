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
  bcrypt.hash(req.body.credentials.password, 10)
    .then(hash => {
      return {
        email: req.body.credentials.email,
        hashedPassword: hash
      }
    })
    .then(user => User.create(user))
    .then(user => user.toJSON())
    .then(user => res.status(201).json({user}))
    .catch(err => handle(err, res))
})

// sign-in
router.post('/sign-in', (req, res) => {
  const pw = req.body.credentials.password

  User.findOne({ email: req.body.credentials.email })
    .then(user => {
      return {
        correctPassword: bcrypt.compare(pw, user.hashedPassword),
        user
      }
    })
    .then(data => {
      if (data.correctPassword) {
        const payload = { id: data.user.id }
        const token = jwt.sign(payload, process.env.KEY, { expiresIn: '1h' })
        res.status(201).json({
          email: data.user.email,
          token
        })
      } else {
        res.status(401).send('fail')
      }
    })
    .catch(err => handle(err, res))
})

const requireToken = passport.authenticate('jwt', { session: false })

// change-password
router.patch('/change-password', requireToken, (req, res) => {
  let user
  User.findById(req.user.id)
    .then(record => {
      user = record
      return bcrypt.hash(req.body.passwords.new, 10)
    })
    .then(hash => {
      user.hashedPassword = hash
      return user.save()
    })
    .then(() => res.sendStatus(200))
    .catch(err => handle(err, res))
})

module.exports = router
