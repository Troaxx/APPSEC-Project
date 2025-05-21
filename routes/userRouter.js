const router = require('express').Router();
const { register, login } = require("../Controller/authFunctions");
const authMiddleware = require("../middleware/authMiddleware");

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

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validating input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        
        // Calling login function from authFunctions.js
        const result = await login(email, password);
        
        // Return token/user data
        res.status(200).json({
            message: "Login successful",
            token: result.token,
            user: {
                id: result.user._id,
                email: result.user.email,
                role: result.user.role
            }
        });
    } catch (error) {
        res.status(401).json({ message: error.message || "Authentication failed" });
    }
});

// Logout route
router.post("/logout", async (req, res) => {
    return res.status(200).json({ message: "Logout successful" });
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