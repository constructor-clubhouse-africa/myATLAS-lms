// Define routes for authentication
import express from 'express';
import { login, refreshToken } from '../controllers/authController.js';
const router = express.Router();

//Post/auth/login returns a signed JWT on valid credentials
router.post('/login', login);
//Post/auth/refresh returns a new signed JWT on valid refresh token
router.post('/refresh', refreshToken);

import { verifyToken } from '../middleware/verifyToken.js';

router.get('/me', verifyToken, (req, res) => {
  res.status(200).json({
    userId: req.user.userId,
    schoolId: req.schoolId,
    role: req.user.role,
  });
});

export default router;
