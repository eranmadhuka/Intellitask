const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER (Signup)
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, phone, gender } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) return res.status(400).json({
            message: "User already exists with this email or username"
        });

        // Create new user with the additional fields
        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            password,
            phone,
            gender,
            role: req.body.role || "user" // Default to "user" if not specified
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Return user data with the additional fields
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
// PROTECTED ROUTE: Only Admins Can Access
router.get("/admin", authMiddleware, (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });
    res.json({ message: "Welcome Admin!" });
});

module.exports = router;
