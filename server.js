require("dotenv").config();
const mongoose = require("mongoose");
const express = require('express');
const helmet = require('helmet');
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");

const userRouter = require('./routes/userRouter')
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security headers with helmet
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://www.google.com"]
        }
    }
}));

const PORT = process.env.BACKEND_PORT || 3001;

app.use(express.json());

//encode the url to ensure that characters are being sent to the server but encoded
app.use(express.urlencoded({ extended: true }));

// Add cookie parser
app.use(cookieParser());

// Enable CORS for frontend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// API routes - no prefix
app.use('', userRouter);

console.log(process.env.DB_CONNECT)

//Setting mongoose to use strict query
mongoose.set('strictQuery', true);

app.listen(PORT, () =>
{
    console.log(`Backend server started on port ${PORT}`);
    console.log(`API available at: http://localhost:${PORT}`);
})

mongoose.connect(process.env.DB_CONNECT)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    