const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

module.exports = mongoose.model("User", UserSchema);
