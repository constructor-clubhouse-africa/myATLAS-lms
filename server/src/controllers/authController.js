//Login and refresh token controller
import prisma from '../lib/prisma.js';
import { comparePassword } from '../lib/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/jwt.js';

//Generic error message for failed login attempts
const INVALID_CREDENTIALS = 'Invalid email or password';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: INVALID_CREDENTIALS });
    }

    //Email is unique globally not per school
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: INVALID_CREDENTIALS });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: INVALID_CREDENTIALS });
    }

    //Generate access and refresh tokens
    const tokenPayload = { userId: user.id, schoolId: user.schoolId, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res
      .status(200)
      .json({ accessToken, refreshToken, forcePasswordChange: user.forcePwChange });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(401).json({ error: INVALID_CREDENTIALS });
  }
}

export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    //Verigying still proves the token is genuine, just stopped trusting its role and schoolId claims, since they may have changed since the token was issued
    const decoded = verifyRefreshToken(refreshToken);
    const currentUser = await prisma.user.findUnique({
      where: {id: decoded.userId},
    });

    //Covers the case where the user has been deleted or disabled since the refresh token was issued
    if(!currentUser) {
      return res.status(401).json({error: 'Invalid or expired refresh token'});
    }

    const accessToken = generateAccessToken({
      userId: currentUser.id,
      schoolId: currentUser.schoolId,
      role: currentUser.role,
    });

    return res.status(200).json({ accessToken });
  } catch (err) {
    console.error('Error during token refresh:', err);
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

export default {login, refreshToken};