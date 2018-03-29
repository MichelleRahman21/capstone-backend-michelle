const mongoose = require('mongoose')
const fs = require('fs')
const dbAdress = require('../config/db')

const User = require('../app/models/user.js')
const Book = require('../app/models/book.js')

mongoose.Promise = global.Promise
mongoose.connect(dbAdress, {
  useMongoClient: true
})

const db = mongoose.connection

const done = () => db.close()

const parseBooks = () => {
  return new Promise((resolve, reject) => {
    const books = []
    const parse = require('csv').parse
    const parser = parse({ columns: true })

    const input = fs.createReadStream('data/books.csv')
    input.on('error', e => reject(e))

    parser.on('readable', () => {
      let record
      while (record = parser.read()) { // eslint-disable-line 
        books.push(record)
      }
    })

    parser.on('error', e => reject(e))
    parser.on('finish', () => resolve(books))
    input.pipe(parser)
  })
}

User.remove({})
  .then(() => Book.remove({}))
  .then(() => {
    return User.create({ email: 'example@user.org', hashedPassword: '12345' })
  })
  .then(user => Promise.all([ user, parseBooks() ]))
  .then(data => {
    let [user, books] = data

    return Promise.all(books.map(book => {
      return Book.create({
        title: book.title,
        author: book.author,
        originalLanguage: book.original_language,
        firstPublished: book.first_published,
        owner: user._id
      })
    }))
  })
  .then(books => {
    console.log(`Created ${books.length} books!`)
  })
  .catch(console.error)
  .then(done)
