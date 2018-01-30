module.exports = function (err, res) {
  if (err.name.match(/Valid/) || err.name === 'MongoError') {
    err.status = 422
  }
  process.env.TESTENV || console.error(err)
  res.status(err.status || 500).json(err)
}
