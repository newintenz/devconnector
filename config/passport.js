const jwtStrategy = require("passport-jwt").Strategy;
const extractJWT = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const Auth = mongoose.model("user");
const keys = require("../config/keys");
const User = require("../models/User");

const opts = {};
opts.jwtFromRequest = extractJWT.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = (passport) => {
  passport.use(
    new jwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then((user) => {
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        })
        .catch((err) => console.log(err));
    })
  );
};
