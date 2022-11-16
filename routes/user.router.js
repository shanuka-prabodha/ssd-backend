const express = require('express');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const registerd = await userModel.findOne({ email: email });

  const login = {
    email,
    password,
  };

  try {
    console.log('Calling login users endpoint... 🡪');
    if (!registerd) {
      res.json({
        error: true,
        message: 'User not found.',
        status: 404,
      });
    } else {
      try {
        if (registerd.email === login.email) {
          const isMatched = await decryptPassword(
            login.password,
            registerd.password
          );
          if (isMatched === true) {
            const token = await createToken(registerd);

            res.status(200).json({
              error: false,
              message: 'User logged successfully.',
              status: 200,
              data: {
                id: registerd.id,
                token: token,
              },
            });
          } else {
            res.status(404).json({ message: 'Password mismatched.' });
          }
        } else {
          res.status(404).json({ message: 'User not found.' });
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
    res.json({
      error: true,
      message: error,
    });
  }
});

router.post('/add', async (req, res) => {
  const { name, email, password, accountType } = req.body;
  const data = {
    name: name,
    email: email,
    password: await encryptPassword(password),
    accountType: accountType,
  };

  try {
    const user = new userModel(data);
    const result = user.save();
    res.json({ message: 'User registered sucessfully.', error: false });
  } catch (error) {
    res.json({ message: error, error: true });
  }
});

const encryptPassword = async (password) => {
  return await new Promise((resolve, reject) => {
    try {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt, function (err, hash) {
          resolve(hash);
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};

const decryptPassword = async (password, hash) => {
  return await new Promise((resolve, reject) => {
    try {
      bcrypt.compare(password, hash, function (err, result) {
        resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const createToken = async (data) => {
  return await new Promise((resolve, reject) => {
    const payload = { data };
    try {
      var token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '10m',
      });
      resolve(token);
    } catch (error) { }
  });
};



function verifyToken(req, res, next) {
  //Get auth header value
  const bearerHeader = req.headers['authorization'];
  const token = bearerHeader && bearerHeader.split(' ')[1]
  //checking if there is a token or not
  if (token == null) {
    return res.sendStatus(401)
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        res.sendStatus(403)
      } else {
        req.user = authData
        next()
      }
    })
  }
}



module.exports = router;
