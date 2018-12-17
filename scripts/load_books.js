const mongoose = require('mongoose')
const fs = require('fs')
const dbAddress = require('../config/db')

const bcrypt = require('bcrypt')
const bcryptSaltRounds = 10

const User = require('../app/models/user.js')
const Book = require('../app/models/book.js')

mongoose.Promise = global.Promise
mongoose.connect(dbAddress, {
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

if (process.argv[2] && process.argv[3]) {
  bcrypt.hash(process.argv[3], bcryptSaltRounds)
    .then((pword) => {
      return User.create({email: process.argv[2], hashedPassword: pword})
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
} else {
  console.log('Script requires email and password')
  done()
}
