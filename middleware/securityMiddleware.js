const rateLimit = require('express-rate-limit');
const axios = require('axios');

// Simple rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per IP per window
    message: {
        error: 'Too many login attempts. Please try again in 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Simple reCAPTCHA v3 verification
const verifyRecaptcha = async (req, res, next) => {
    try {
        const { recaptchaToken } = req.body;
        
        // Check if reCAPTCHA is configured
        if (!process.env.RECAPTCHA_SECRET_KEY) {
            console.log('⚠️  No reCAPTCHA secret key configured, skipping verification');
            return next();
        }
        
        if (!recaptchaToken || recaptchaToken === 'no-recaptcha-token') {
            console.log('⚠️  No reCAPTCHA token provided, skipping verification');
            return next();
        }

        // Verify with Google reCAPTCHA API
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            new URLSearchParams({
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaToken
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        const { success, score } = response.data;
        
        if (!success || score < 0.5) {
            console.log('❌ reCAPTCHA failed:', { success, score });
            return res.status(400).json({ 
                error: 'reCAPTCHA verification failed. Please try again.' 
            });
        }
        
        console.log('✅ reCAPTCHA passed with score:', score);
        next();
        
    } catch (error) {
        console.error('reCAPTCHA verification error:', error.message);
        return res.status(500).json({ 
            error: 'Security verification failed. Please try again.' 
        });
    }
};

module.exports = {
    loginLimiter,
    verifyRecaptcha
};