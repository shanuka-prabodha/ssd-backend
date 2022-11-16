var admin = require("firebase-admin");

var serviceAccount = require("../firebase-key.json");

const BUCKET = "gs://software-d935e.appspot.com";

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: BUCKET
})

const bucket = admin.storage().bucket();

const uploadFile = (req, res, next) => {

    if (!req.file) return next();  
    const file = req.file;
    const fileUpload = Date.now() + "." + file.originalname.split(".").pop();

    const _file = bucket.file(fileUpload);

    const stream = _file.createWriteStream({
        metadata: {
            contentType: file.mimeType,
        }
    })

    stream.on("error", (e) => {
        console.log(e);
    })


    stream.on("finish", async (e) => {
         await _file.makePublic();

    })
    req.file.firebaseUrl = `https://storage.googleapis.com/software-d935e.appspot.com/${fileUpload}`
    stream.end(file.buffer)
}

module.exports = uploadFile