require("dotenv").config();
const mongoose = require("mongoose");
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/userRouter')
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

const PORT = process.env.PORT || 3001;

app.use(express.json());

//encode the url to ensure that characters are being sent to the server but encoded
app.use(express.urlencoded({ extended: true }));

// Add cookie parser
app.use(cookieParser());

// Note: Protected routes are now handled by React Router in the frontend
// Role-based access control is implemented in React components

// API routes
app.use('', userRouter);

// Serve React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing - send all non-API requests to React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

//This line of code is importing the userRouter module from the './routes/userRouter' file.
//Remember to uncomment this line when working on userRouter.js
// const userRouter = require('./routes/userRouter')

console.log(process.env.DB_CONNECT)

//Setting mongoose to use strict query
mongoose.set('strictQuery', true);

app.listen(PORT, () =>
{
    console.log(`Server started on port ${PORT}`);
    console.log(`React app will be served from: http://localhost:${PORT}`);
})

mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    