// Define routes for authentication
import express from 'express';
import {login, refreshToken} from '../controllers/authController.js';
const router = express.Router();

//Post/auth/login returns a signed JWT on valid credentials
router.post('/login', login);
//Post/auth/refresh returns a new signed JWT on valid refresh token
router.post('/refresh', refreshToken);

export default router;