module.exports = function (err, res) {
  // HTTP RESPONSES

  if (err.Error) {
    err = err.Error
  }

  // there are `ValidationError`s and `ValidatorErrors`, so use a regex
  // to catch them both
  if (err.name.match(/Valid/) || err.name === 'MongoError') {
    err.status = 422
  } else if (err.name === 'OwnershipError') {
    err.status = 401
  } else if (err.name === 'DocumentNotFound') {
    err.status = 404
  } else if (err.name === 'CastError') {
    err.status = 422
  }

  // if set a status code above, send that status code
  // otherwise, send 500. Also, send the error message as JSON.
  res.status(err.status || 500).json(err)

  // LOG ERRORS

  // don't log errors in a test environment
  process.env.TESTENV || console.error(err)
}
