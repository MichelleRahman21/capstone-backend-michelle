module.exports = function (err, res) {
  if (err.name === 'ValidationError') {
    err.status = 422
  }
  res.status(err.status || 500).json(err)
}
