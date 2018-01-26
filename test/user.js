process.env.TESTENV = true

let mongoose = require('mongoose')
let User = require('../app/models/user')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
let should = chai.should()

chai.use(chaiHttp)

describe('Users', () => {
  const userParams = {
    credentials: {
      email: 'foo@bar.baz',
      password: '12345',
      password_confirmation: '12345'
    }
  }

  beforeEach(done => {
    User.remove({}, e => {
      done()
    })
  })

  describe('POST /sign-up', () => {
    it('should create a user if params are valid', done => {
      chai.request(server)
        .post('/sign-up')
        .send(userParams)
        .end((e, res) => {
          res.should.have.status(201)
          res.should.be.a('object')
          res.body.should.have.property('user')
          res.body.user.should.have.property('email').eql(userParams.credentials.email)
          done()
        })
    })

    it('should reject users with duplicate emails', done => {
      const params = userParams
      params.credentials.hashedPassword = 'this is not very secure'

      User.create(params.credentials)

      chai.request(server)
        .post('/sign-up')
        .send(userParams)
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          res.should.be.a('object')
          res.body.should.have.property('errmsg')
          done()
        })
    })
  })
})
