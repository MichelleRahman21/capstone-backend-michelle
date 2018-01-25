const Catch = require('../models/catch')
const handle = require('../../lib/error_handler')

module.exports = function (app, db) {
  // create
  app.post('/catches', (req, res) => {
    Catch.create(req.body)
      .then(record => {
        res.status(201).json(record.toJSON())
      })
      .catch(err => handle(err, res))
  })

  // show
  app.get('/catches/:id', (req, res) => {
    Catch.findById(req.params.id)
      .then(record => record.toJSON())
      .then(record => res.status(200).json(record))
      .catch(err => handle(err, res))
  })

  // index
  app.get('/catches', (req, res) => {
    Catch.find()
      .then(records => {
        return records.map(record => record.toJSON())
      })
      .then(records => res.status(200).json(records))
      .catch(err => handle(err, res))
  })

  // update
  app.patch('/catches/:id', (req, res) => {
    Catch.findById(req.params.id)
      .then(record => Object.assign(record, req.body))
      .then(record => record.save())
      .then(() => res.sendStatus(204))
      .catch(err => handle(err, res))
  })

  // destroy
  app.delete('/catches/:id', (req, res) => {
    Catch.findById(req.params.id)
      .then(record => record.remove())
      .then(() => res.sendStatus(204))
      .catch(err => handle(err, res))
  })
}
