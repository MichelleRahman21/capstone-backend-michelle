const express = require('express')
const passport = require('passport')

const Book = require('../models/book')

const requireToken = passport.authenticate('bearer', {session: false})

const removeBlanks = require('../../lib/remove_blank_fields')
// const handleErrors = require('../../lib/error_handler')
const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership

const router = express.Router()

// GET books (index)
router.get('/books', requireToken, (req, res, next) => {
  Book.find({ owner: req.user._id })
    .populate('owner')
    .then(books => {
      return books.map(book => book.toObject())
    })
    .then(books => res.status(200).json({books: books}))
    .catch(next)
})
//  GET Books id
router.get('/books/:id', requireToken, (req, res, next) => {
  const id = req.params.id
  Book.findById(id)
    // .populate('owner')
    .then(handle404)
    .then(book => {
      requireOwnership(req, book)
      res.status(200).json({ book: book.toObject() })
    })
    .catch(next)
})
// DELETE book with id
router.delete('/books/:id', requireToken, (req, res, next) => {
  Book.findById(req.params.id)
    .then(handle404)
    .then(book => {
      requireOwnership(req, book)
      book.remove()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})
// CREATE A BOOK
router.post('/books', requireToken, (req, res, next) => {
  const book = req.body.book
  book.owner = req.user._id
  Book.create(book)
    .then(book => res.status(201).json({ book: book.toObject() }))
    .catch(next)
})

// UPDATE A BOOK 204 option returns no content
// router.patch('/books/:id', requireToken, removeBlanks, (req, res, next) => {
//   delete req.body.book.owner
//
//   Book.findById(req.params.id)
//     .then(handle404)
//     .then(book => {
//       requireOwnership(req, book)
//
//       // return book.update(req.body.book)
//     })
//     .then(() => res.sendStatus(204))
//     .catch(next)
// })

router.patch('/books/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.book.owner

  Book.findById(req.params.id)
    .then(handle404)
    .then(book => {
      requireOwnership(req, book)

      return book.set(req.body.book).save()
    })
    .then(book => res.status(200).json({ book: book.toObject() }))
    // .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
