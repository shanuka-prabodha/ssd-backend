const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');


const app = express();

app.use(cors());
dotenv.config();

app.use(bodyParser.json());
const Port = process.env.PORT || 4000;
const URL = process.env.DATABASE_URI;

app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

mongoose.connect(URL).catch(console.error);

const connection = mongoose.connection;


connection.once('open', () => {
    console.log('Mongo DB Connection success.');
});


app.listen(Port, () => {
    console.log(`Server is up and running on port ${Port}.`);
});
