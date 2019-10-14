const mongoose = require('mongoose')

const instaPostSchema = new mongoose.Schema({
  imagePost: [{
    title: String,
    url: mongoose.SchemaTypes.Url
  }],
  url: [{
    type: String,
    required: true
  }],
  user: [{
    type: mongoose.Schema.Type.ObjectId,
    ref: 'Owner',
    required: true
  }],
  tag: {
    type: String
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('InstaPost', instaPostSchema)
