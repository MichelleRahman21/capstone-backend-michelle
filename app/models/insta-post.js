const mongoose = require('mongoose')

const instaPostSchema = new mongoose.Schema({
  title: String,
  url: [{
    type: String
    // required: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tag: {
    type: String
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('InstaPost', instaPostSchema)
