const {verifyAccessToken} = require('../lib/jwt');

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Missing or malformed Authorization Header' });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded; //MY-05 will read req.user.schoolID and attach req.schoolID to the request object for use in subsequent middleware or route handlers
        next();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired access token' });
    }
}

module.exports = {verifyToken};