process.env.TESTENV = true

let mongoose = require("mongoose")
let Example = require('../app/models/example.js')
let User = require('../app/models/user')

const jwt = require('jsonwebtoken')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
let should = chai.should()

chai.use(chaiHttp)

let token
let userId

describe('Examples', () => {
  const exampleParams = {
    title: '13 JavaScript tricks WDI instructors don\'t want you to know',
    text: 'You won\'believe number 8!'
  }

  before(done => {
    Example.remove({})
      .then(() => User.create({ email: 'caleb', hashedPassword: '12345' }))
      .then(user => {
        const payload = { id: user._id }
        userId = user._id
        token = jwt.sign(payload, process.env.KEY, { expiresIn: '1h' })
        done()
      })
      .catch(console.error)
  })

  describe('GET /examples', () => {
    it('should get all the examples', done => {
      chai.request(server)
        .get('/examples')
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.examples.should.be.a('array')
          res.body.examples.length.should.be.eql(0)
          done()
        })
    })
  })

  describe('DELETE /examples/:id', () => {
    let exampleId

    before(done => {
      Example.create(Object.assign(exampleParams, { owner: userId }))
        .then(record => {
          exampleId = record._id
          done()
        })
        .catch(console.error)
    })

    it('should return status code 204', done => {
      chai.request(server)
        .delete('/examples/' + exampleId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })
  })

  describe('POST /examples', () => {
    it('should not POST an example without a title', done => {
      let noTitle = {
        text: 'Untitled',
        owner: 'fakedID'
      }
      chai.request(server)
        .post('/examples')
        .set('Authorization', `Bearer ${token}`)
        .send({ example: noTitle })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          res.body.should.have.property('errors')
          res.body.errors.should.have.property('title')
          res.body.errors.title.should.have.property('kind').eql('required')
          done()
        })
    })

    it('should not POST an example without text', done => {
      let noText = {
        title: 'Not a very good example, is it?',
        owner: 'fakeID'
      }
      chai.request(server)
        .post('/examples')
        .set('Authorization', `Bearer ${token}`)
        .send({ example: noText })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          res.body.should.have.property('errors')
          res.body.errors.should.have.property('text')
          res.body.errors['text'].should.have.property('kind').eql('required')
          done()
        })
    })

    it('should POST an example with the correct params', done => {
      let validExample = {
        title: 'I ran a shell command. You won\'t believe what happened next!',
        text: 'it was rm -rf / --no-preserve-root'
      }
      chai.request(server)
        .post('/examples')
        .set('Authorization', `Bearer ${token}`)
        .send({ example: validExample })
        .end((e, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('example')
          res.body.example.should.have.property('title')
          res.body.example.title.should.eql(validExample.title)
          done()
        })
    })
  })

  describe('PATCH /examples/:id', () => {
    let exampleId

    const fields = {
      title: 'Find out which HTTP status code is your spirit animal',
      text: 'Take this 4 question quiz to find out!'
    }

    before(async function () {
      await Example.create(Object.assign(exampleParams, { owner: userId }))
        .then(record => {
          exampleId = record._id
        })
    })

    it('should update fields when PATCHed', done => {
      chai.request(server)
        .patch(`/examples/${exampleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ example: fields })
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('shows the updated resource when fetched with GET', done => {
      chai.request(server)
        .get(`/examples/${exampleId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.example.title.should.eql(fields.title)
          res.body.example.text.should.eql(fields.text)
          done()
        })
    })
  })
})
