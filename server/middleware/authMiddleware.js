const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    console.log("Authorization Header:", token); // Debug
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
    try {
        const cleanToken = token.replace("Bearer ", ""); // Remove Bearer prefix
        console.log("Clean Token:", cleanToken); // Debug
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); // Debug
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token Verification Error:", error.message); // Debug
        res.status(401).json({ message: "Invalid token", error: error.message });
    }
};



module.exports = authMiddleware;
