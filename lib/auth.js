// require authentication related packages
const passport = require('passport')
const passportJWT = require('passport-jwt')

// user model will be used to set `req.user` in
// authenticated routes
const User = require('../app/models/user')

const jwtOptions = {
  // parse the token from a header on incoming http requests
  // that header should look like this:
  // Authorization: Bearer <token_string>
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  // sign tokens with a private key from our .env file
  secretOrKey: process.env.KEY
}

// the callback provided here with signature `(payload, next)` will
// be run on every route that calls `passport.authenticate`
const strategy = new passportJWT.Strategy(jwtOptions, (payload, next) => {
  // payload returned from server looks similar to:
  // { id: '5a7db52ec7bf8f42530ba0a8',
  // iat: 1518188287,
  // exp: 1518191887 }
  // id --> user's id, iat --> issued at, exp --> time the token expires

  // find a user based on the ID decoded from the payload
  User.findById(payload.id)
    .then(user => {
      // findById will return either a Mongoose record or null
      // `next` passes it through to the route, `null` is passed
      // because `next` expects an error as its first param
      next(null, user)
    })
    .catch(console.error)
})

// serialize and deserialize functions are used by passport under
// the hood to determine what `req.user` should be inside routes
passport.serializeUser((user, done) => {
  // we want access to the full Mongoose object that we got in the
  // strategy callback, so we just pass it along with no modifications
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

// register this strategy with passport
passport.use(strategy)

// create a passport middleware based on all the above configuration
module.exports = passport.initialize()
