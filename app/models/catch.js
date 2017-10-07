const mongoose = require('mongoose')

const catchSchema = new mongoose.Schema({
  species: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  notes: String,
  position: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  }
})

module.exports = mongoose.model('Catch', catchSchema)
