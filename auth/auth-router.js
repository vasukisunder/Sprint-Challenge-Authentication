const router = require('express').Router();
const {isValid} = require('./authenticate-middleware');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/dbConfig');
const secret = require('./secrets');

router.post('/register', (req, res) => {
  const credentials = req.body;

  if(isValid(credentials)){
    const rounds = process.env.BCRYPT_ROUNDS || 8;
    const hash = bcryptjs.hashSync(credentials.password, rounds);

    credentials.password = hash;

    db("users").insert(credentials)
    .then(id => {
      db("users").where({id: id[0]})
      .then(post => {
        res.status(201).json(post);
      })
      .catch(err => {
        res.status(500).json(err);
      })
    })
    .catch(err => {
      res.status(500).json(err);
    })

  } else {
    res.status(400).json({msg: "must provide username and password (as strings)"})
  }

});

router.post('/login', (req, res) => {
  const {username, password} = req.body;

  if (isValid(req.body)) {
    db("users").where({ username }).first()
    .then(user => {
      if (user && bcryptjs.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({msg: `Welcome ${user.username}!`, token });
      } else {
        res.status(401).json({msg: "invalid credentials"});
      }
    })
    .catch(err => {
      res.status(500).json(err);
    })
  } else {
    res.status(400).json({msg: "must provide username and password (as strings)"})
  }
});

function generateToken(user) {
  const payload = {
      subject: user.id,
      username: user.username,
      department: user.department
  }
  const options = {
      expiresIn: '1d'
  }

  return jwt.sign(payload, secret.jwtSecret, options);
}

module.exports = router;
