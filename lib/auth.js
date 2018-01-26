// require authentication related packages
const passport = require('passport')
const passportJWT = require('passport-jwt')

const User = require('../app/models/user')

const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'TODO GRAB ME FROM .ENV'
}

const strategy = new JwtStrategy(jwtOptions, (payload, next) => {
  User.findOne({ id: payload.id })
    .then(user => next(null, user))
    .catch(console.error)
})

passport.use(strategy)

module.exports = passport.initialize()
