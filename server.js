require("dotenv").config();
const mongoose = require("mongoose");
const express = require('express');
const path = require('path');

const userRouter = require('./routes/userRouter')


const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

//encode the url to ensure that characters are being sent to the server but encoded
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public'), {index:'index.html'}));

app.use('', userRouter);

//This line of code is importing the userRouter module from the './routes/userRouter' file.
//Remember to uncomment this line when working on userRouter.js
// const userRouter = require('./routes/userRouter')

console.log(process.env.DB_CONNECT)

//Setting mongoose to use strict query
mongoose.set('strictQuery', true);


app.listen(PORT, () =>
{
    console.log(`Server started on port ${PORT}`);
    console.log(`Click here to access http://localhost:${PORT}`);
})

mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log("Connected to MongoDB");
    })
