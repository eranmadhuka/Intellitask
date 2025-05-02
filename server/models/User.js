const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    gender: { type: String, required: true },
    role: { type: String, default: "user" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resetToken: String,
    resetTokenExpiry: Date,
});

userSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.resetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    return resetToken;
};

module.exports = mongoose.model("User", userSchema);