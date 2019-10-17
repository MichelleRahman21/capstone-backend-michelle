const express = require('express')
const passport = require('passport')
const InstaPost = require('../models/insta-post')
const multer = require('multer')
const multerUpload = multer()

const { s3Upload } = require('../../lib/s3Files.js')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

// GET
router.get('/instaposts/', (req, res, next) => {
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
    .catch(next)
})
// POST/CREATE
router.post('/instaposts', requireToken, multerUpload.single('image'), (req, res, next) => {
  const instapost = req.body
  instapost.owner = req.user.id
  s3Upload(req.file)
    .then(s3Response => InstaPost.create({
      title: instapost.title,
      url: s3Response.Location,
      owner: instapost.owner
    }))
    .then(instapost =>
      res.status(201).json({ instaPost: instapost.toObject() }))
    .catch(next)
})
// PATCH
router.patch('/instaposts/:id', requireToken, multerUpload.single('image'), (req, res, next) => {
  delete req.body.owner
  s3Upload(req.file)
    .then(s3Response => {
      InstaPost.findById(req.params.id)
        .then(handle404)
        .then(instapost => {
          requireOwnership(req, instapost)
          return instapost.set({
            title: req.body.title,
            url: s3Response.Location
          }).save()
        })
        .then(instapost => res.status(200).json({ instaPost: instapost.toObject() }))
        .catch(next)
    })
})

// DELETE/DESTORY
router.delete('/instaposts/:id', requireToken, (req, res, next) => {
  InstaPost.findById(req.params.id)
    .then(handle404)
    .then(instaPost => {
      requireOwnership(req, instaPost)
      instaPost.remove()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
