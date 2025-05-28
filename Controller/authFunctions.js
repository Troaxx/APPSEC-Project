const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const validator = require("validator");
const User = require("../Database/user");

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

        // Password validation
        if (!password || password === "") {
            return res.status(400).json({ message: "Please enter a password." });
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

// Login function
const login = async (email, password) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found. Invalid login credentials.");
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Incorrect password.");
        }

        // Create JWT payload
        const payload = {
            user_id: user._id,
            role: user.role,
            email: user.email,
            name: user.name
        };

        // Sign token and return promise
        return new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: "2 hours" },
                (err, token) => {
                    if (err) {
                        console.error("JWT Error Details:", err);
                        reject(new Error("Error signing token."));
                    }

                    resolve({
                        token: token,  // Return just the token without "Bearer " prefix
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

// Export functions
module.exports = {
    register,
    login,
    logout
};