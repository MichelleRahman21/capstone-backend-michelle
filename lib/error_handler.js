module.exports = function (err, res) {
  if (err.name === 'ValidationError' || err.name === 'MongoError') {
    err.status = 422
  }
  process.env.TESTENV || console.error(err)
  res.status(err.status || 500).json(err)
}
