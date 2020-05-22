const jwt = require('jsonwebtoken');
const secret = require('./secrets');

module.exports = {
  isValid,
  authenticate
}

function isValid(user) {
  return Boolean(user.username && user.password && typeof user.password === "string");
}

function authenticate(req, res, next) {
  const token = req.headers.authorization;

  if (token){
    jwt.verify(token, secret.jwtSecret, (error, decodedToken) => {
      if (error) {
        res.status(401).json({msg: "invalid credentials"})
      } else {
        req.jwt = decodedToken;
        next();
      }
    })
  } else {
    res.status(400).json({msg: "please provide auth info"})
  }
}