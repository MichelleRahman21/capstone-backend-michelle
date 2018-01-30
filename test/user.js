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

  describe('POST /sign-up', () => {
    beforeEach(done => {
      User.remove({})
        .then(() => done())
        .catch(() => done())
    })

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

      User.create(userParams)
        .then(() => {
          chai.request(server)
            .post('/sign-up')
            .send(userParams)
            .end((e, res) => {
              res.should.have.status(422)
              res.should.be.a('object')
              res.body.should.have.property('errmsg')
              done()
            })
        })
        .catch(() => done())
    })
  })

  describe('POST /sign-in', () => {
    let token

    before(done => {
      chai.request(server)
        .post('/sign-up')
        .send(userParams)
        .end(() => done())
    })

    after(done => {
      User.remove({})
        .then(() => done())
        .catch(() => done())
    })

    it('should return a token when given valid credentials', done => {
      chai.request(server)
        .post('/sign-in')
        .send(userParams)
        .end((e, res) => {
          res.should.have.status(201)
          res.should.be.a('object')
          res.body.should.have.property('token')
          res.body.token.should.be.a('string')
          token = res.body.token
          done()
        })
    })

    it('the token should allow you to GET /catches', done => {
      chai.request(server)
        .get('/catches')
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.have.property('catches')
          res.body.catches.should.be.a('array')
          done()
        })
    })
  })
})
