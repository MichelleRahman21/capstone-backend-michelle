process.env.TESTENV = true

let mongoose = require("mongoose")
let Catch = require('../app/models/catch')
let User = require('../app/models/user')

const jwt = require('jsonwebtoken')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
let should = chai.should()

chai.use(chaiHttp)

let token

describe('Catches', () => {
  const example = {
    species: 'boringfish',
    date: '2/2/2002',
    position: {
      latitude: 99,
      longitude: 99
    }
  }

  before(done => {
    Catch.remove({})
      .then(() => User.create({ email: 'caleb', hashedPassword: '12345' }))
      .then(user => {
        const payload = { id: user.id }
        token = jwt.sign(payload, process.env.KEY, { expiresIn: '1h' })
        done()
      })
  })

  describe('GET /catches', () => {
    it('should get all the catches', done => {
      chai.request(server)
        .get('/catches')
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.catches.should.be.a('array')
          res.body.catches.length.should.be.eql(0)
          done()
        })
    })
  })

  describe('DELETE /catches/:id', () => {
    let catchId

    before(async function () {
      await Catch.create(example)
        .then(record => {
          catchId = record._id
        })
    })

    it('should return status code 204', done => {
      chai.request(server)
        .delete('/catches/' + catchId)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })
  })

  describe('POST /catches', () => {
    it('should not POST a catch without a species', done => {
      let noSpecies = {
        date: '08/12/2015',
        position: {
          latitude: 25,
          longitude: 33
        }
      }
      chai.request(server)
        .post('/catches')
        .set('Authorization', `Bearer ${token}`)
        .send({ catch: noSpecies })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          res.body.should.have.property('errors')
          res.body.errors.should.have.property('species')
          res.body.errors.species.should.have.property('kind').eql('required')
          done()
        })
    })

    it('should not POST a catch with partial position data', done => {
      let partialPosition = {
        species: 'tuna',
        date: '08/12/2015',
        position: {
          longitude: 33
        }
      }
      chai.request(server)
        .post('/catches')
        .set('Authorization', `Bearer ${token}`)
        .send({ catch: partialPosition })
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          res.body.should.have.property('errors')
          res.body.errors.should.have.property('position.latitude')
          res.body.errors['position.latitude'].should.have.property('kind').eql('required')
          done()
        })
    })

    it('should POST a catch with the correct params', done => {
      let validCatch = {
        species: 'blowfish',
        date: '1/1/2001',
        position: {
          latitude: 40,
          longitude: 35
        }
      }
      chai.request(server)
        .post('/catches')
        .set('Authorization', `Bearer ${token}`)
        .send({ catch: validCatch })
        .end((e, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('catch')
          res.body.catch.should.have.property('species')
          res.body.catch.species.should.eql(validCatch.species)
          done()
        })
    })
  })

  describe('PATCH /catches/:id', () => {
    let catchId

    const fields = {
      species: 'editfish',
      position: {
        latitude: 10,
        longitude: 15
      }
    }

    before(async function () {
      await Catch.create(example)
        .then(record => {
          catchId = record._id
        })
    })

    it('should update fields when PATCHed', done => {
      chai.request(server)
        .patch(`/catches/${catchId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ catch: fields })
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('shows the updated resource when fetched with GET', done => {
      chai.request(server)
        .get(`/catches/${catchId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.catch.species.should.eql(fields.species)
          res.body.catch.position.latitude.should.eql(fields.position.latitude)
          done()
        })
    })
  })
})
