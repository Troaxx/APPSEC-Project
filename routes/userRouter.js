const router = require('express').Router();
const { register, login, verify2FA, resendVerificationCode, toggle2FA, getLockoutStatus, clearAccountLockout, requestPasswordReset, resetPassword } = require("../Controller/authFunctions");
const authMiddleware = require("../middleware/authMiddleware");
const { loginLimiter, verifyRecaptcha } = require("../middleware/securityMiddleware");

// Member Registration Route
router.post("/register-member", (req, res) => {
    register(req.body, "member", res);
});

// Secretary Registration Route
router.post("/register-secretary", async (req, res) => {
    await register(req.body, "secretary", res);
});

// Treasurer Registration Route
router.post("/register-treasurer", async (req, res) => {
    await register(req.body, "treasurer", res);
});

// President Registration Route
router.post("/register-president", async (req, res) => {
    await register(req.body, "president", res);
});

// Enhanced Login Route with security features
router.post("/login", loginLimiter, verifyRecaptcha, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validating input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }
        
        // Calling enhanced login function
        const result = await login(email, password);
        
        // Check if 2FA is required
        if (result.requires2FA) {
            return res.status(200).json({
                requires2FA: true,
                userId: result.userId,
                message: result.message
            });
        }
        
        // Set cookie with token for browser navigation
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60 * 1000 // 2 hours
        });
        
        // Return token/user data
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user
        });
    } catch (error) {
        res.status(401).json({ error: error.message || "Authentication failed" });
    }
});

// Logout route
router.post("/logout", async (req, res) => {
    // Clear the authentication cookie with proper options
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    return res.status(200).json({ message: "Logout successful" });
});

// GET logout route for direct navigation
router.get("/logout", async (req, res) => {
    // Clear the authentication cookie with proper options
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    // Redirect to logout page
    res.redirect('/logout.html');
});

// 2FA verification route
router.post("/verify-2fa", async (req, res) => {
    try {
        const { userId, code } = req.body;
        
        if (!userId || !code) {
            return res.status(400).json({ error: "User ID and verification code are required." });
        }
        
        const result = await verify2FA(userId, code);
        
        // Set cookie with token
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 2 * 60 * 60 * 1000
        });
        
        res.status(200).json({
            success: true,
            message: "2FA verification successful",
            token: result.token,
            user: result.user
        });
    } catch (error) {
        res.status(401).json({ error: error.message || "2FA verification failed" });
    }
});

// Resend verification code route
router.post("/resend-verification", async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }
        
        const result = await resendVerificationCode(userId);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message || "Failed to resend verification code" });
    }
});

// Get lockout status route
router.post("/lockout-status", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }
        
        const result = await getLockoutStatus(email);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message || "Failed to get lockout status" });
    }
});

// Request password reset route
router.post("/request-password-reset", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }
        
        const result = await requestPasswordReset(email);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message || "Failed to send password reset email" });
    }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token and new password are required." });
        }
        
        const result = await resetPassword(token, newPassword);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message || "Failed to reset password" });
    }
});

// Toggle 2FA route (protected)
router.post("/toggle-2fa", authMiddleware(["member", "treasurer", "secretary", "president"]), async (req, res) => {
    try {
        const { enable } = req.body;
        const userId = req.user.user_id;
        
        const result = await toggle2FA(userId, enable);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to update 2FA settings" });
    }
});

// Public unprotected route
router.get("/public", (req, res) => {
    return res.status(200).json({ message: "Public route accessed" });
});

// Member protected route - accessible by member, treasurer, secretary, president
router.get("/member-protected", authMiddleware(["member", "treasurer", "secretary", "president"]), (req, res) => {
    return res.status(200).json({ message: "Member protected route accessed" });
});

// Treasurer protected route - accessible by treasurer, secretary, president
router.get("/treasurer-protected", authMiddleware(["treasurer", "secretary", "president"]), (req, res) => {
    return res.status(200).json({ message: "Treasurer protected route accessed" });
});

// Secretary protected route - accessible by secretary, president
router.get("/secretary-protected", authMiddleware(["secretary", "president"]), (req, res) => {
    return res.status(200).json({ message: "Secretary protected route accessed" });
});

// President protected route - accessible only by president (admin)
router.get("/president-protected", authMiddleware(["president"]), (req, res) => {
    return res.status(200).json({ message: "President protected route accessed" });
});

module.exports = router;