const User = require('../models/user')
const handle = require('../../lib/error_handler')
const bcrypt = require('bcrypt')

module.exports = function (app, db) {
  // sign-up
  app.post('/sign-up', (req, res) => {
    console.log('REQ BODY:\n', req.body)
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
}
