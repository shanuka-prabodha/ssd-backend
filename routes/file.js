const express = require('express');
const uploadFile = require('../services/firebase');
const File = require('../models/file.model');
const Router = express.Router();
const crypto = require("crypto");
const jwt = require('jsonwebtoken');

Router.post('/upload', verifyToken,
  async (req, res) => {

    try {

      console.log(req.user.data._id);
      uploadFile(req, res)
      const { title, description } = req.body;
      const { firebaseUrl, mimetype, originalname } = req.file;
      console.log(firebaseUrl);
      const file = new File({
        title,
        description,
        file_path: firebaseUrl,
        file_mimetype: mimetype,
        originalname: originalname,
        users: req.user.data._id
      });

      file.save().then(() => {
        res.send(firebaseUrl);
      }).catch((err) => {
        console.log(err.message);
        res.status(500).send({ status: "Error with uploading data", error: err.message });
      })
    } catch (error) {

    }
  });


Router.get('/get-files', verifyToken,
  async (req, res) => {

    try {

      const files = await File.find({ users: req.user.data._id })
      res.send(files);

    } catch (error) {

    }
  });

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




module.exports = Router;

