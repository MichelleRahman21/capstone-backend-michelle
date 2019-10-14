const express = require('express')
const passport = require('passport')

const InstaPost = require('../models/insta-post')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// GET
router.get('/instaposts', (req, res, next) => {
  InstaPost.find()
    .then(instaPosts => {
      return instaPosts.map(instaPost => instaPost.toObject())
    })
    .then(instaPosts => res.status(200).json({ instaPosts: instaPosts }))
    .catch(next)
})
// GET/SHOW shows only one insta post
router.get('/instaposts/:id', (req, res, next) => {
  InstaPost.findById(req.params.id)
    .then(handle404)
    .then(instaPost => res.status(200).json({ instaPost: instaPost.toObject() }))
})
// POST/CREATE
router.post('/instaPosts', requireToken, (req, res, next) => {
  req.file.owner = req.user.id
    .then(mongooseResponse =>
      res.status(201).json({ instaPost: mongooseResponse.toObject() }))
    .catch(next)
})

// UPDATE/PATCH
router.patch('/instaPosts/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.user

  InstaPost.findById(req.params.id)
    .then(handle404)
    .then(instaPost => {
      requireOwnership(req, instaPost)

      return instaPost.updateOne(req.body.fileUpload)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

// DELETE/DESTORY
router.delete('/instaPosts/:id', requireToken, (req, res, next) => {
  InstaPost.findById(req.params.id)
    .then(handle404)
    .then(instaPost => {
      requireOwnership(req, instaPost)
      instaPost.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
