const catchRoutes = require('./catch_routes')
const userRoutes = require('./user_routes')

module.exports = function (app, db) {
  catchRoutes(app, db)
  userRoutes(app, db)
}
