const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check for Bearer token in Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify token and attach user payload to request
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        // Invalid token
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = authenticate;
