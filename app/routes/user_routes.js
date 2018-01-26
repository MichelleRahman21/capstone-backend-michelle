const User = require('../models/user')
const handle = require('../../lib/error_handler')
const bcrypt = require('bcrypt')

module.exports = function (app, db) {
  // sign-up
  app.post('/sign-up', (req, res) => {
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
  app.post('/sign-in', (req, res) => {
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
}
