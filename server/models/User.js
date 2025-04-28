const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },

        // Additional Fields
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        phone: {
            type: String,
            match: [/^\+?\d{10,15}$/, "Invalid phone number format"], // Supports international numbers
            trim: true
        },
        gender: { type: String, enum: ["male", "female", "other", "prefer not to say"], default: "prefer not to say" },

        // Reset Password Fields
        resetToken: String,
        resetTokenExpiry: Date,
    },
    { timestamps: true }
);

// Hash password before saving (only if changed)
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare Password Method (for login)
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Password Reset Token
UserSchema.methods.generateResetToken = function () {
    // Create a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token and save it to the database
    this.resetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    
    // Set expiry time (1 hour)
    this.resetTokenExpiry = Date.now() + 3600000;

    return resetToken;
};

// Reset Password Method
UserSchema.methods.resetPassword = async function (newPassword) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(newPassword, salt);
    this.resetToken = undefined; // Clear reset token after password reset
    this.resetTokenExpiry = undefined;
};

module.exports = mongoose.model("User", UserSchema);
