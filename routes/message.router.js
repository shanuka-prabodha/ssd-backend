const router = require("express").Router();
const { request } = require("express");
let Message = require("../models/message.model");
const crypto = require("crypto");

//symetric key encription start here

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
  "----BEGIN PUBLIC KEY-----\n" +
  "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCp182vERvNV9yEezJqVpIQFxXC\n" +
  "cOZ+zjQVIX6J0v+u7hvgE2S3Ct+bPx7ynpriX2+NTutrjPfjRCmzZQjRxN4ZLu5U\n" +
  "wQlciFfLgnTUk0i/epjdKp62VdFQTl4VOJYdF7gkQPmMcip+2ravHEPoNEwVFDF1\n" +
  "ihDoXyZbc/AmAychFwIDAQAB\n" +
  "-----END PUBLIC KEY-----";

User_privateKey =
  "-----BEGIN RSA PRIVATE KEY-----\n" +
  "MIICXwIBAAKBgQCp182vERvNV9yEezJqVpIQFxXCcOZ+zjQVIX6J0v+u7hvgE2S3\n" +
  "Ct+bPx7ynpriX2+NTutrjPfjRCmzZQjRxN4ZLu5UwQlciFfLgnTUk0i/epjdKp62\n" +
  "VdFQTl4VOJYdF7gkQPmMcip+2ravHEPoNEwVFDF1ihDoXyZbc/AmAychFwIDAQAB\n" +
  "AoGBAJoeDjF29+B8gsjgtd3SkpXxLLiVFEMqwA4Qp69O/N5yiG7rii+iuUc5ns6P\n" +
  "54HVEfeLDos4jtP2TVTRMJCQ8OswW/BAtp3fHGNFsCSualyU0u1+R6YbAE3BJvsF\n" +
  "I3HmbkczY+/6/NcKx816YPuuSP/i3AY0P98aQuZehzVZM855AkEA8tP3uOMq78b8\n" +
  "SIq8xS0OO0akuksjtHFpf49ab5yCdlReG9FVKubxZ8G6Zuhi7LPE6x/dgXpqvcuD\n" +
  "4qzLBPEqswJBALMOVDZ+rhCoqjJCPo3fTzkHm+Lz/hDcp5p0Qo1wKU7cws91DwVC\n" +
  "fB2K2vKsLcEJvRWf3s+xA+L+buvMZNGrMg0CQQCReFSWKVkGjgGC/8I4qVY2Qora\n" +
  "o7r/FVYrOdjmti8d7kr2hUBtVC7YhqFBlwP0Y3mbldpf/9NEYlBfEj8JdeSrAkEA\n" +
  "omafqOGTHNbtrzH4LJNa9n3ZPKpSSJbpiSRjbIdLYBTIuIMSgZHAosbbOPlDcm9T\n" +
  "yXY8D6IcxVhB4Kp80tJ0TQJBAPBWQM+VOpWxB6MojYrwz5fgW2XnhUNfl7pUViPK\n" +
  "lkxzoLvAd5L+BmG8/E0LcEJewzhJeVoVBZ7+nhNWWUVALlw=\n" +
  "-----END RSA PRIVATE KEY-----";

let key_private = new NodeRSA(User_privateKey);

let key_public = new NodeRSA(User_privateKey);

router.route("/asyencrip").post(async (req, res) => {
  //ecncription algorithm

  if (req.body) {
    const sender = req.body.senderId;
    const message = req.body.message;

    //encrypt the string using encription algorithm,private key and initializaton vector

    var encriptedmessage = key_private.encrypt(message, "base64");
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
      let decryptedMessage = key_public.decrypt(messgaeobject.message, "utf-8");

      console.log(decryptedMessage);

      res.status(200).send({ decryptedMessage: decryptedMessage });
    }
  }
});

//asymetric user input key api start here

module.exports = router;
