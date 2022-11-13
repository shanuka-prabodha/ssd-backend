const express = require('express');
const uploadFile = require('../services/firebase');
const File = require('../models/file.model');
const Router = express.Router();


Router.post('/upload',
  async (req, res) => {

    try {
      uploadFile(req, res)
      const { title, description, userId, } = req.body;
      const { firebaseUrl, mimetype,originalname } = req.file;
      console.log(firebaseUrl);
      const file = new File({
        title,
        description,
        file_path: firebaseUrl,
        file_mimetype: mimetype,
        originalname: originalname,
        users: userId
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



module.exports = Router;

