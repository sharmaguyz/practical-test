const jwt = require('jsonwebtoken');
const adminModel = require('../models/admin');
const { isTokenBlacklisted } = require('../models/token_blacklist');

async function checkLoggedIn(req, res, next) {
    try {
        const token = req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (await isTokenBlacklisted(token)) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = await adminModel.findByEmail(decoded.email);
        if (!req.admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token',exception:error.message });
    }
}

const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.permissions || !req.permissions.includes(requiredPermission)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};

module.exports = {
    checkLoggedIn,
    checkPermission
};