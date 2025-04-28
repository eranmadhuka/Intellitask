const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// REGISTER (Signup)
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, phone, gender, role } = req.body;

        // Check if user already exists by email or username
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email or username" });
        }

        // Hash password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user object
        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            phone,
            gender,
            role: role || "user", // Default role is 'user'
        });

        await newUser.save(); // Save user to database

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }); // Find user by email

        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate JWT Token for authentication
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

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
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
 
// PROTECTED ROUTE: Only Admins Can Access
router.get("/admin", authMiddleware, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }
    res.json({ message: "Welcome Admin!" });
});

// FORGOT PASSWORD (Sends Reset Link)
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }); // Find user by email

        if (!user) return res.status(400).json({ message: "User not found" });

        // Generate and store reset token
        const resetToken = user.generateResetToken(); // Ensure this method is implemented in the User model
        await user.save();

        // Password reset link
        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Configure nodemailer for sending emails
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Click the link to reset your password: ${resetLink}`,
        };

        transporter.sendMail(mailOptions, (err, _info) => {
            if (err) {
                return res.status(500).json({ message: "Error sending email" });
            }
            res.json({ message: "Password reset link sent to email" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Hash the token and find the user
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() }, // Check if token is still valid
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: "Password reset successfully. You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// USER MANAGEMENT ROUTES

// Get all user details (Protected Route)
router.get("/users", async (req, res) => { 
    try {
        // Retrieve all users from the database
        const users = await User.find(); 

        if (users.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }

        res.status(200).json({ success: true, users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


// Add User Route
router.post("/add", async (req, res) => {
    try {
        const { firstName, lastName, username, email, password, phone, gender, role } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !username || !email || !password || !phone || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists by email or username
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email or username" });
        }

        // Hash password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user object
        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            phone,
            gender,
            role: role || "user", // Default role is 'user'
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Update user details (Protected Route)
router.put("/user/update/:id", async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ success: "User updated successfully", updatedUser });
    } catch (err) {
        console.error(err);  // Server-side error log
        res.status(500).json({ error: err.message });
    }
});

// Delete user (Protected Route)
router.delete("/user/delete/:id", async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ success: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;


// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // Exclude password
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


// PROTECTED ROUTE: Get user profile (Requires authentication)
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        // Fetch user data using ID from token
        const user = await User.findById(req.user.id).select("-password"); // Exclude password
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});