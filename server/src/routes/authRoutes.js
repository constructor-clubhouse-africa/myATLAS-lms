// Define routes for authentication
const express = require('/lib/prisma');
const router = express.Router();
const authController = require('../controllers/authController');

//Post/auth/login returns a signed JWT on valid credentials
router.post('/login', authController.login);
//Post/auth/refresh returns a new signed JWT on valid refresh token
router.post('/refresh', authController.refreshToken);
//Post/auth/logout invalidates the refresh token
router.post('/logout', authController.logout);