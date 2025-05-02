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

        // Debug log
        console.log("Forgot password request for:", email);

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            console.log("User not found:", email);
            // For security, still return success even if user not found
            return res.json({
                message: "If your email is registered, you will receive a password reset link shortly"
            });
        }

        console.log("User found, generating token");

        // Generate reset token - wrap in try/catch to catch any errors here
        let resetToken;
        try {
            resetToken = user.generateResetToken();
            await user.save();
            console.log("Reset token generated and saved");
        } catch (tokenError) {
            console.error("Error generating token:", tokenError);
            return res.status(500).json({ message: "Error generating reset token" });
        }

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        console.log("Reset URL:", resetUrl);

        // Check if environment variables are set
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error("Email environment variables not set");
            return res.status(500).json({ message: "Email configuration error" });
        }

        // Configure email with more detailed error logging
        let transporter;
        try {
            transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            console.log("Email transporter created");
        } catch (emailError) {
            console.error("Error creating email transporter:", emailError);
            return res.status(500).json({ message: "Email configuration error" });
        }

        // Email content
        const mailOptions = {
            from: `"Your App Name" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Request",
            html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Please click the link below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link is valid for 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        };

        console.log("Attempting to send email to:", email);

        // Send email with proper promise handling
        try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully");

            // Send success response
            res.json({
                message: "If your email is registered, you will receive a password reset link shortly"
            });
        } catch (sendError) {
            console.error("Error sending email:", sendError);
            res.status(500).json({ message: "Error sending email. Please try again later." });
        }

    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        console.log('Reset password request for token:', token);

        // Validate password strength
        if (!newPassword || newPassword.length < 8) {
            console.log('Password validation failed');
            return res.status(400).json({
                message: "Password must be at least 8 characters long",
            });
        }

        // Hash token to match stored version
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        console.log('Hashed token:', hashedToken);

        // Find user with this token and valid expiry
        const user = await User.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            console.log('No user found or token expired');
            return res.status(400).json({
                message: "Password reset link is invalid or has expired",
            });
        }

        console.log('User found, updating password');

        // Update password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset token fields
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();
        console.log('Password reset successful');

        res.json({
            message: "Password reset successfully. You can now log in with your new password.",
        });
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// USER MANAGEMENT ROUTES

// Get all user details (Protected Route)
router.get("/users", authMiddleware, async (req, res) => {
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

// Add User Route (Protected for Admins)
router.post("/add", authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

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
router.put("/user/update/:id", authMiddleware, async (req, res) => {
    try {
        // if (req.user.role !== "admin") {
        //     return res.status(403).json({ message: "Access denied" });
        // }

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
router.delete("/user/delete/:id", authMiddleware, async (req, res) => {
    try {
        // if (req.user.role !== "admin") {
        //     return res.status(403).json({ message: "Access denied" });
        // }

        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ success: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user by ID
router.get('/users/:id', authMiddleware, async (req, res) => {
    try {
        // if (req.user.role !== "admin") {
        //     return res.status(403).json({ message: "Access denied" });
        // }

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

module.exports = router;