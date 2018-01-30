module.exports = function (err, res) {
  // there are `ValidationError`s and `ValidatorErrors`, so use a regex
  // to catch them both
  if (err.name.match(/Valid/) || err.name === 'MongoError') {
    err.status = 422
  } else if (err.name === 'OwnershipError') {
    err.status = 401
  }
  // if were not in a test environment, log the error
  console.error('ERR:', err)
  res.status(err.status || 500).json(err)
}
