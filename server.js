require("dotenv").config();
const mongoose = require("mongoose");
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/userRouter')
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

//encode the url to ensure that characters are being sent to the server but encoded
app.use(express.urlencoded({ extended: true }));

// Add cookie parser
app.use(cookieParser());

// Protected routes for role-based pages (MUST come before static middleware)
app.get('/president', authMiddleware(['president']), (req, res) => {
    const filePath = path.join(__dirname, 'protected', 'president.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Page not found');
    }
});

app.get('/secretary', authMiddleware(['secretary', 'president']), (req, res) => {
    const filePath = path.join(__dirname, 'protected', 'secretary.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Page not found');
    }
});

app.get('/treasurer', authMiddleware(['treasurer', 'secretary', 'president']), (req, res) => {
    const filePath = path.join(__dirname, 'protected', 'treasurer.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Page not found');
    }
});

app.get('/member', authMiddleware(['member', 'treasurer', 'secretary', 'president']), (req, res) => {
    const filePath = path.join(__dirname, 'protected', 'member.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Page not found');
    }
});

app.get('/home', authMiddleware(['member', 'treasurer', 'secretary', 'president']), (req, res) => {
    const filePath = path.join(__dirname, 'protected', 'home.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Page not found');
    }
});

// Serve only public files as static (login, register, logout, css, js) - AFTER protected routes
app.use(express.static(path.join(__dirname, 'public'), {
    index: 'login.html'
}));

app.use('', userRouter);

//This line of code is importing the userRouter module from the './routes/userRouter' file.
//Remember to uncomment this line when working on userRouter.js
// const userRouter = require('./routes/userRouter')

console.log(process.env.DB_CONNECT)

//Setting mongoose to use strict query
mongoose.set('strictQuery', true);

app.listen(PORT, () =>
{
    console.log(`Frontend Server started on port ${PORT}`);
    console.log(`Click here to access login page: http://localhost:${PORT}/login.html`);
})

mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log("Connected to MongoDB");
    })
