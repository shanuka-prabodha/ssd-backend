const router = require("express").Router();
const { request } = require("express");
let Message = require("../models/message.model");
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
//symetric key encription start here

const algorithm = "aes-256-cbc";

//private key
// const key = "this-is-to-encript-messages-ssd-";

//random 16 digits initialization vector
const iv = crypto.randomBytes(16);

router.route("/add").post(verifyToken, async (req, res) => {
  //ecncription algorithm

  if (req.body) {
    const sender = req.user._id;
    const message = req.body.message;
    const key = req.headers["key"];

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

    const messgaeobject = await Message.findOne({ message: encrtedmessage });

    if (messgaeobject == null) {
      res.status(401).send("Not found");
      return;
    } else {
      const originaldata = Buffer.from(messgaeobject.iv, "base64");

      const decipher = crypto.createDecipheriv(algorithm, key, originaldata);

      let decryptedMessage = decipher.update(
        messgaeobject.message,
        "hex",
        "utf-8"
      );
      decryptedMessage += decipher.final("utf-8");

      res.status(200).send({ decryptedMessage: decryptedMessage });
    }
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

//symetric key encription routes ends here

//asymetric key encription start here

const NodeRSA = require("node-rsa");

const secrete = "This is asymetric key encription";

// const asykey = new NodeRSA({ b: 1024 });

// var public_key = asykey.exportKey("public");

// var private_key = asykey.exportKey("private");

// console.log("Public key : ", public_key);

// console.log("private key : ", private_key);

User_publicKey =
  "-----BEGIN PUBLIC KEY-----\n" +
  "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCIoQ2UWxy32PoIPtBQupMGUkJp\n" +
  "d05GxXwVEgQjmpJJ/MqDqVsv7ZHDZ0tW5f+xzEkxJGqTC16lLdE2Ctc07wlgzyYK\n" +
  "AUt9ZfvRHegA2cGdSCxvnV8yohFUgEIQA1MRKfsaBNdPIs4UZ9TZZXLsrjAX6dm2\n" +
  "ENrT9OL1DKhePXolHQIDAQAB\n" +
  "-----END PUBLIC KEY-----";

User_privateKey =
  "-----BEGIN RSA PRIVATE KEY-----\n" +
  "MIICXAIBAAKBgQCIoQ2UWxy32PoIPtBQupMGUkJpd05GxXwVEgQjmpJJ/MqDqVsv\n" +
  "7ZHDZ0tW5f+xzEkxJGqTC16lLdE2Ctc07wlgzyYKAUt9ZfvRHegA2cGdSCxvnV8y\n" +
  "ohFUgEIQA1MRKfsaBNdPIs4UZ9TZZXLsrjAX6dm2ENrT9OL1DKhePXolHQIDAQAB\n" +
  "AoGANalrt/UBFoQ1z787+jkNPdJZGyssp0cxMOVeks1G36BVudhuZCies2yCfqLf\n" +
  "BmoB5Tc0VISGq8GPBfbEB5pKyBB3ZKmpctIE9r0imUxW0Ts8btD9qCKbgM3+Pquk\n" +
  "En2z3mJd94umT0SuGJeWXMxPunOJPno34co+0ADjuLA9+QECQQDp/JQbLrdxEgNA\n" +
  "2sGLUTYXRxMj7RkEjnOdKUseIB8dqBE8ZFv5PFkYe782qfj2tXSVXKmhKUYItCC7\n" +
  "RfTxYwpNAkEAlXut+0uh1utjTiPRy8CrHnXKdWxH1wAekyS8rm5b+JvLp6owSrq3\n" +
  "5hH1aDOQq+/ZcQP4eIqlpsveOgjsx09OEQJBAKazZ0UydEjfP2geMhOyiSnuXimT\n" +
  "SuafIqlOeRD+a4yyZ40yJwCbSRKTXzhvwkrqHiQnf0atZBLhWgxyG786A2UCQCdE\n" +
  "ALSU7mMlG8XH1PEfoBN1P4ROuCQ6zM08BjAPnysTyZA2PU8z8uCFcSA5A1SWwVhV\n" +
  "gawwR0kkHjDCbWgBZfECQEBn8oTRjMkawvwGgeh9q4Nbr34IAamWZV1RM4Aheygj\n" +
  "kTX7h1i3tDj/RE4MBiDHwOllvBkiLS2HaEe1KNvpJbE=\n" +
  "-----END RSA PRIVATE KEY-----";

let key_private = new NodeRSA(User_privateKey);

let key_public = new NodeRSA(User_publicKey);

router.route("/asyencrip").post(async (req, res) => {
  //ecncription algorithm

  if (req.body) {
    const sender = req.body.senderId;
    const message = req.body.message;

    //encrypt the string using encription algorithm,private key and initializaton vector

    var encriptedmessage = key_public.encrypt(message, "base64");
    const saveMessage = {
      senderId: sender,
      message: encriptedmessage,
      iv: "",
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

router.route("/asydicrp").get(async (req, res) => {
  if (req.body && req.body.encriptedmessage) {
    const encrtedmessage = req.body.encriptedmessage;

    console.log(encrtedmessage);

    const messgaeobject = await Message.findOne({ message: encrtedmessage });

    if (messgaeobject == null) {
      res.status(401).send("Not found");
      return;
    } else {
      let decryptedMessage = key_private.decrypt(
        messgaeobject.message,
        "utf-8"
      );

      console.log(decryptedMessage);

      res.status(200).send({ decryptedMessage: decryptedMessage });
    }
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


//asymetric user input key api start here

module.exports = router;
