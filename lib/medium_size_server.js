const express = require('express')
const bodyParser = require('body-parser')
// for this example, we'll use an in-memory array in place of a database
const books = [
  { id: 0, title: 'Dictionary', author: 'Webster' },
  { id: 1, title: 'Encyclopedia', author: 'Encarta' },
  { id: 2, title: 'Clean Code', author: 'Robert Cecil Martin' }
]
// create a variable and store express
const app = express()

app.use(bodyParser.json())

app.get('/books', (req, res) => {
  res.status(200).json({ books })
})

app.get('/books/:id', (req, res) => {
  const id = req.params.id
  const book = books[id]
  if (!book) {
    res.sendStatus(404)
  }
  res.status(200).json({ book: books[id] })
})

app.post('/books', (req, res) => {
  const book = req.body.book
  // books.push(book)
  // book.id = books.indexOf(book)

  res.status(201).json({ book })
})
// run our server on port 3000
app.listen(3000, () => console.log('I hear stuff on port 3000'))
