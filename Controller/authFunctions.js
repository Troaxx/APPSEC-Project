const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const validator = require("validator");
const User = require("../Database/user");
const emailService = require("../services/emailService");

// Register function
const register = async (userData, role, res) => {
    try {
        const { username, password, email } = userData;
        
        // Username validation
        if (!username || username === "") {
            return res.status(400).json({ message: "Please enter a username." });
        }
        
        let usernameNotTaken = await validateUsername(username);
        if (!usernameNotTaken) {
            return res.status(400).json({
                message: `Username is already registered.`
            });
        }
        const sanitizedUsername = validator.escape(username);

        // Email validation
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ message: "Please enter a valid email." });
        }
        
        const sanitizedEmail = validator.normalizeEmail(email);
        let emailNotRegistered = await validateEmail(email);
        if (!emailNotRegistered) {
            return res.status(400).json({
                message: `Email is already registered.`
            });
        }

        // Password validation with policy
        if (!password || password === "") {
            return res.status(400).json({ message: "Please enter a password." });
        }
        
        // Check password policy
        const passwordCheck = validatePasswordPolicy(password);
        if (!passwordCheck.isValid) {
            return res.status(400).json({ message: passwordCheck.message });
        }
        
        const sanitizedPassword = validator.trim(password);
        const hashedPassword = bcrypt.hashSync(sanitizedPassword, 12);

        // Role validation
        const accountRoles = ["president", "treasurer", "secretary", "member"];
        if (!role || !accountRoles.includes(role.toLowerCase())) {
            return res.status(400).json({ message: "Please enter a valid account type." });
        }

        const newUser = new User({ 
            name: sanitizedUsername,
            email: sanitizedEmail,
            role: role.toLowerCase(),
            password: hashedPassword
        });

        await newUser.save();
        return res.status(201).json({ message: "You are now registered." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};

// Validation functions
//findOne = mongo function to find a user by a given field
const validateUsername = async (username) => {
    const user = await User.findOne({ name: username });
    return user ? false : true;
};

const validateEmail = async (email) => {
    const user = await User.findOne({ email });
    return user ? false : true;
};

// Simple password policy validation
const validatePasswordPolicy = (password) => {
    // Minimum 8 characters
    if (password.length < 8) {
        return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    
    // Must contain uppercase letter
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one uppercase letter" };
    }
    
    // Must contain lowercase letter
    if (!/[a-z]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one lowercase letter" };
    }
    
    // Must contain number
    if (!/\d/.test(password)) {
        return { isValid: false, message: "Password must contain at least one number" };
    }
    
    // Must contain special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one special character (!@#$%^&*)" };
    }
    
    return { isValid: true };
};

// Check if account is locked
// This function checks if the account is locked and if it is, it throws an error
const checkAccountLockout = async (user) => {
    if (user.loginAttempts.lockedUntil && user.loginAttempts.lockedUntil > new Date()) {
        const remainingTime = Math.ceil((user.loginAttempts.lockedUntil - new Date()) / 60000);
        throw new Error(`Account is locked. Please try again in ${remainingTime} minutes.`);
    }
    
    // Reset lockout if expired
    if (user.loginAttempts.lockedUntil && user.loginAttempts.lockedUntil <= new Date()) {
        user.loginAttempts.count = 0;
        user.loginAttempts.lockedUntil = null;
        await user.save();
    }
};

// Function to get lockout status for a user
const getLockoutStatus = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }

        const isLocked = user.loginAttempts.lockedUntil && user.loginAttempts.lockedUntil > new Date();
        const remainingTime = isLocked 
            ? Math.ceil((user.loginAttempts.lockedUntil - new Date()) / 1000) // seconds
            : 0;
        
        return {
            isLocked,
            remainingTime,
            failedAttempts: user.loginAttempts.count,
            lockedUntil: user.loginAttempts.lockedUntil
        };
    } catch (err) {
        throw err;
    }
};

// Enhanced login function with security features
const login = async (email, password) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid email or password.");
        }

        // Check account lockout
        await checkAccountLockout(user);

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Increment failed attempts
            user.loginAttempts.count += 1;
            user.loginAttempts.lastAttempt = new Date();
            
            // Calculate remaining attempts
            const remainingAttempts = Math.max(0, 5 - user.loginAttempts.count);
            
            // Lock account after 5 failed attempts for 15 minutes
            if (user.loginAttempts.count >= 5) {
                user.loginAttempts.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
                await user.save();
                throw new Error("Account locked due to too many failed attempts. Please try again in 15 minutes.");
            }
            
            await user.save();
            
            // Throw error with remaining attempts information
            const errorMessage = remainingAttempts > 0 
                ? `Invalid email or password. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
                : "Invalid email or password.";
            
            const error = new Error(errorMessage);
            error.remainingAttempts = remainingAttempts;
            error.failedAttempts = user.loginAttempts.count;
            throw error;
        }

        // Reset failed attempts on successful password verification
        user.loginAttempts.count = 0;
        user.loginAttempts.lockedUntil = null;
        await user.save();

        // Always generate 2FA code (required for all logins)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = {
            code: verificationCode,
            expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
            resendCount: 0,
            lastResendTime: null
        };
        await user.save();
        
        // Send email with verification code
        await emailService.sendVerificationCode(user.email, verificationCode, user.name);
        
        return { 
            requires2FA: true, 
            userId: user._id,
            message: "Verification code sent to your email." 
        };
    } catch (err) {
        throw err;
    }
};

// Logout function
const logout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Successfully logged out"
        });
    } catch (err) {
        return res.status(500).json({
            message: `An error occurred during logout: ${err.message}`
        });
    }
};

// 2FA verification function
const verify2FA = async (userId, code) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Check if verification code exists and is not expired
        if (!user.verificationCode || user.verificationCode.expiresAt < new Date()) {
            throw new Error("Verification code expired. Please login again.");
        }

        // Check if the code matches
        if (user.verificationCode.code !== code) {
            throw new Error("Invalid verification code");
        }

        // Clear verification code
        user.verificationCode = null;
        await user.save();

        // Generate JWT token
        const payload = {
            user_id: user._id,
            role: user.role,
            email: user.email,
            name: user.name
        };

        return new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: "2 hours" },
                (err, token) => {
                    if (err) {
                        reject(new Error("Error signing token."));
                    }
                    resolve({
                        token: token,
                        user: {
                            id: user._id,
                            role: user.role,
                            email: user.email,
                            name: user.name
                        }
                    });
                }
            );
        });
    } catch (err) {
        throw err;
    }
};

// Function to resend verification code
const resendVerificationCode = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        // Check if user has a verification code
        if (!user.verificationCode) {
            throw new Error("No verification code found. Please login again.");
        }

        // Check if code is expired
        if (user.verificationCode.expiresAt < new Date()) {
            throw new Error("Verification code expired. Please login again.");
        }

        // Check resend count (max 3 times)
        if (user.verificationCode.resendCount >= 3) {
            throw new Error("Maximum resend attempts reached. Please login again.");
        }

        // Check if 45 seconds have passed since last resend
        if (user.verificationCode.lastResendTime) {
            const timeSinceLastResend = Date.now() - user.verificationCode.lastResendTime.getTime();
            if (timeSinceLastResend < 45000) { // 45 seconds
                const remainingTime = Math.ceil((45000 - timeSinceLastResend) / 1000);
                throw new Error(`Please wait ${remainingTime} seconds before resending.`);
            }
        }

        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = {
            code: verificationCode,
            expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes
            resendCount: user.verificationCode.resendCount + 1,
            lastResendTime: new Date()
        };
        await user.save();
        
        // Send email with new verification code
        await emailService.sendVerificationCode(user.email, verificationCode, user.name);
        
        return { 
            success: true, 
            message: "New verification code sent to your email.",
            resendCount: user.verificationCode.resendCount
        };
    } catch (err) {
        throw err;
    }
};

// Function to clear account lockout
const clearAccountLockout = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }
        
        user.loginAttempts.count = 0;
        user.loginAttempts.lockedUntil = null;
        user.loginAttempts.lastAttempt = null;
        await user.save();
        
        return { 
            success: true, 
            message: `Account lockout cleared for ${email}` 
        };
    } catch (err) {
        throw err;
    }
};

// Function to request password reset
const requestPasswordReset = async (email) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }

        // Generate a simple verification code (6 digits)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store verification code in user document with expiration
        user.passwordResetCode = verificationCode;
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        // Send email with verification code
        await emailService.sendPasswordResetCode(user.email, verificationCode, user.name);
        
        return { 
            success: true, 
            message: "Verification code sent to your email",
            email: email // Return email for frontend to use in next step
        };
    } catch (err) {
        throw err;
    }
};

// Function to verify reset code and generate reset token
const verifyResetCode = async (email, code) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }

        // Check if code matches and is not expired
        if (user.passwordResetCode !== code) {
            throw new Error("Invalid verification code");
        }

        if (user.passwordResetExpires < new Date()) {
            throw new Error("Verification code has expired");
        }

        // Generate reset token for password change
        const resetToken = jwt.sign(
            { user_id: user._id, email: user.email, purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '15 minutes' }
        );

        // Store reset token and clear verification code
        user.passwordResetToken = resetToken;
        user.passwordResetCode = null;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        return { 
            success: true, 
            message: "Code verified successfully",
            resetToken: resetToken
        };
    } catch (err) {
        throw err;
    }
};

// Function to reset password with token
const resetPassword = async (token, newPassword) => {
    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is for password reset
        if (decoded.purpose !== 'password_reset') {
            throw new Error("Invalid token purpose");
        }
        
        const user = await User.findById(decoded.user_id);
        if (!user) {
            throw new Error("Invalid reset token");
        }

        // Check if token is expired
        if (user.passwordResetExpires < new Date()) {
            throw new Error("Reset token has expired");
        }

        // Check if token matches
        if (user.passwordResetToken !== token) {
            throw new Error("Invalid reset token");
        }

        // Validate new password
        const passwordCheck = validatePasswordPolicy(newPassword);
        if (!passwordCheck.isValid) {
            throw new Error(passwordCheck.message);
        }

        // Hash new password
        const hashedPassword = bcrypt.hashSync(newPassword, 12);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        user.passwordChangedAt = new Date();
        
        // Add to password history
        user.passwordHistory.push({
            password: hashedPassword,
            changedAt: new Date()
        });

        // Keep only last 5 passwords in history
        if (user.passwordHistory.length > 5) {
            user.passwordHistory = user.passwordHistory.slice(-5);
        }

        await user.save();
        
        return { 
            success: true, 
            message: "Password reset successful" 
        };
    } catch (err) {
        throw err;
    }
};

// Function to enable/disable 2FA
const toggle2FA = async (userId, enable) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        
        user.twoFactorEnabled = enable;
        await user.save();
        
        return { 
            success: true, 
            message: `2FA ${enable ? 'enabled' : 'disabled'} successfully` 
        };
    } catch (err) {
        throw err;
    }
};

// Export functions
module.exports = {
    register,
    login,
    logout,
    verify2FA,
    resendVerificationCode,
    toggle2FA,
    getLockoutStatus,
    clearAccountLockout,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    validatePasswordPolicy
};