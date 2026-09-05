
//Login and refresh token controller
const prisma = require('/lib/prisma');
const {comaprePassword} = require('../lib/password');
const {generateAccessToken, generateRefreshToken, verifyRefreshToken} = require('../lib/jwt');

//Generic error message for failed login attempts
const INVALID_CREDENTIALS = 'Invalid email or password';

async function login(req, res) {
    try{
        const { email, password } = req.body;

        //email is unique globally not per school
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if(!user){
            return res.status(401).json({ error: INVALID_CREDENTIALS });
        }

        const isMatch = await comparePassword(password, user.password);
        if(!isMatch){
            return res.status(401).json({ error: INVALID_CREDENTIALS });
        }

        //Generate access and refresh tokens
        const tokenPayload = { userId: user.id, schoolId: user.schoolId, role: user.role };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return res.status(200).json({ accessToken, refreshToken, forcePasswordChange: user.forcePasswordChange});
    } catch (INVALID_CREDENTIALS){
        return res.status(401).json({ error: INVALID_CREDENTIALS });
    }
}


async function refreshToken(req, res) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token is required' });
        }

        //Throws if the token is invalid or expired
        const tokenPayload = verifyRefreshToken(refreshToken);
        const accessToken = generateAccessToken(tokenPayload);

        return res.status(200).json({accessToken});
    } catch (INVALID_CREDENTIALS){
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
}

module.exports = { login, refreshToken };