const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Simple email configuration
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'your-app-password'
            }
        });
    }

    // Send 2FA verification code
    async sendVerificationCode(email, code, username) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: email,
                subject: 'Your Login Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Hi ${username}!</h2>
                        <p>Your verification code is:</p>
                        <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 8px;">${code}</h1>
                        </div>
                        <p style="color: #666;">This code will expire in 5 minutes.</p>
                        <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
                    </div>
                `
            };
            
            await this.transporter.sendMail(mailOptions);
            console.log('Verification code sent successfully');
            return true;
        } catch (error) {
            console.error('Email sending failed:', error);
            return false;
        }
    }

    // Send password reset verification code
    async sendPasswordResetCode(email, code, username) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: email,
                subject: 'Password Reset Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Hi ${username}!</h2>
                        <p>You requested a password reset for your account.</p>
                        <p>Your verification code is:</p>
                        <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
                            <h1 style="color: #007bff; margin: 0; font-size: 32px; letter-spacing: 8px;">${code}</h1>
                        </div>
                        <p style="color: #666;">This code will expire in 10 minutes.</p>
                        <p style="color: #666;">If you didn't request this reset, please ignore this email.</p>
                        <p style="color: #666;">Enter this code on the password reset page to continue.</p>
                    </div>
                `
            };
            
            await this.transporter.sendMail(mailOptions);
            console.log('Password reset verification code sent successfully');
            return true;
        } catch (error) {
            console.error('Password reset code email sending failed:', error);
            return false;
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(email, resetLink, username) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: email,
                subject: 'Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Hi ${username}!</h2>
                        <p>You requested a password reset for your account.</p>
                        <p>Click the button below to reset your password:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" 
                               style="background: #007bff; color: white; padding: 12px 30px; 
                                      text-decoration: none; border-radius: 5px; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #666;">This link will expire in 1 hour.</p>
                        <p style="color: #666;">If you didn't request this reset, please ignore this email.</p>
                        <p style="color: #666;">For security, this link can only be used once.</p>
                    </div>
                `
            };
            
            await this.transporter.sendMail(mailOptions);
            console.log('Password reset email sent successfully');
            return true;
        } catch (error) {
            console.error('Password reset email sending failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();