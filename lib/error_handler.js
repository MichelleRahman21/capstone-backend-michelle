module.exports = function (err, res) {
  console.log(err)
  res.status(err.status || 500).json(err)
}
