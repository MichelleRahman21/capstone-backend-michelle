process.env.TESTENV = true

let mongoose = require("mongoose")
let Catch = require('../app/models/catch')

let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../server')
let should = chai.should()

chai.use(chaiHttp)

describe('Catches', () => {
  before(done => {
    Catch.remove({}, e => {
      done()
    })
  })

  describe('GET /catches', () => {
    it('it should get all the catches', done => {
      chai.request(server)
        .get('/catches')
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(0)
          done()
        })
    })
  })

  describe('POST /catches', () => {
    it('it should not POST a catch without a species', done => {
      let noSpecies = {
        date: '08/12/2015',
        position: {
          latitude: 25,
          longitude: 33
        }
      }
      chai.request(server)
        .post('/catches')
        .send(noSpecies)
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          res.body.should.have.property('errors')
          res.body.errors.should.have.property('species')
          res.body.errors.species.should.have.property('kind').eql('required')
          done()
        })
    })

    it('it should not POST a catch with partial position data', done => {
      let partialPosition = {
        species: 'tuna',
        date: '08/12/2015',
        position: {
          longitude: 33
        }
      }
      chai.request(server)
        .post('/catches')
        .send(partialPosition)
        .end((e, res) => {
          res.should.have.status(422)
          res.should.be.a('object')
          res.body.should.have.property('errors')
          res.body.errors.should.have.property('position.latitude')
          res.body.errors['position.latitude'].should.have.property('kind').eql('required')
          done()
        })
    })

    it('it should POST a catch with the correct params', done => {
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
        .send(validCatch)
        .end((e, res) => {
          res.should.have.status(201)
          res.body.should.be.a('object')
          res.body.should.have.property('_id')
          res.body.species.should.eql(validCatch.species)
          done()
        })
    })
  })

  describe('PATCH /catches/:id', () => {
    let catchId

    const example = {
      species: 'boringfish',
      date: '2/2/2002',
      position: {
        latitude: 99,
        longitude: 99
      }
    }

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

    it('it should update fields when PATCHed', done => {
      chai.request(server)
        .patch(`/catches/${catchId}`)
        .send(fields)
        .end((e, res) => {
          res.should.have.status(204)
          done()
        })
    })

    it('shows the updated resource when fetched with GET', done => {
      chai.request(server)
        .get(`/catches/${catchId}`)
        .end((e, res) => {
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.species.should.eql(fields.species)
          res.body.position.latitude.should.eql(fields.position.latitude)
          done()
        })
    })
  })
})
