const jwt = require('jsonwebtoken');
const UserModel = require('../models/users');
const { isTokenBlacklisted } = require('../models/token_blacklist');

async function userCheckAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const idToken = req.headers['x-id-token'] || req.headers['id-token'];
        if (!idToken || !token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (await isTokenBlacklisted(token)) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findByEmail(decoded.email);
        req.user = user;
        if (idToken) {
            const cognitoDecoded = jwt.decode(idToken);
            const cognitoSub = cognitoDecoded?.sub;
            if (!cognitoSub || user.cognitoSub !== cognitoSub) {
                return res.status(401).json({ message: 'Cognito Sub not matched' });
            }
        }
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token',
            exception: error.message
        });
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
    userCheckAuth,
    checkPermission
};