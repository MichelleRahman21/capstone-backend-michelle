const express = require('express')
const bodyParser = require('body-parser')

const books = []

const app = express()

app.use(bodyParser.json())

app.use((req, res, next) => {
  console.log(`Got a ${req.method} request to ${req.originalUrl}`)
  next()
})

app.get('/books', (req, res) => {
  const response = JSON.stringify({ books })

  res.status(200).send(response)
})

app.get('/books/:id', (req, res) => {
  const book = JSON.stringify({
    book: books[req.params.id]
  })

  res.status(200).send(book)
})

app.post('/books', (req, res) => {
  const book = req.body.book

  books.push(book)
  book.id = books.indexOf(book)

  const response = JSON.stringify({ book })

  res.status(201).send(response)
})

app.listen(4741, () => console.log('Example app listening on port 4741!'))
