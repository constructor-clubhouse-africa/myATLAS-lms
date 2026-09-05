const jwt = require('jsonwebtoken');
// Load environment variables from .env file
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
//Token expiry 8 hours for access token, 30 days for refresh token
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN;

//Fail at the startup if the secrets are not set in the environment variables
if(!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET){
    throw new Error('Missing JWT secrets in environment variables');
}

//Payload must contain userId, schoolId, and role (no other related data such as email or password)
function generateAccessToken(payload) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};