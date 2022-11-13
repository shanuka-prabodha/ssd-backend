const router = require("express").Router();
const { request } = require("express");
let Message = require("../models/message.model");
const crypto = require("crypto");

const algorithm = "aes-256-cbc";

//private key
const key = "this-is-to-encript-messages-ssd-";

//random 16 digits initialization vector
const iv = crypto.randomBytes(16);

router.route("/add").post(async (req, res) => {
  //ecncription algorithm

  if (req.body) {
    const sender = req.body.senderId;
    const message = req.body.message;

    //encrypt the string using encription algorithm,private key and initializaton vector

    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encriptedmessage = cipher.update(message, "utf-8", "hex");
    encriptedmessage += cipher.final("hex");

    const base64data = Buffer.from(iv, "binary").toString("base64");

    const saveMessage = {
      senderId: sender,
      message: encriptedmessage,
      iv: base64data,
    };

    const messageobject = new Message(saveMessage);
    messageobject
      .save()
      .then((data) => {
        res.status(200).send({ data: data });
      })
      .catch((error) => {
        res.status(500).send(error.message);
      });
  }
});

router.route("/read").get(async (req, res) => {
  if (req.body && req.body.encriptedmessage) {
    const encrtedmessage = req.body.encriptedmessage;

    const messgaeobject = await Message.findOne({ message: encrtedmessage })
      .then(() => {
        if (messgaeobject == null) {
          res.status(401).send("Not found");
          return;
        } else {
          const originaldata = Buffer.from(messgaeobject.iv, "base64");

          const decipher = crypto.createDecipheriv(
            algorithm,
            key,
            originaldata
          );

          let decryptedMessage = decipher.update(
            messgaeobject.message,
            "hex",
            "utf-8"
          );
          decryptedMessage += decipher.final("utf-8");

          res.status(200).send({ decryptedMessage: decryptedMessage });
        }
      })
      .catch((error) => {
        res.status(500).send(error.message);
      });
  }
});

router.route("/readAll").get(async (req, res) => {
  await Message.find()
    .then((ms) => {
      res.json(ms);
    })
    .catch((error) => {
      res.status(500).send(error.message);
    });
});

module.exports = router;
