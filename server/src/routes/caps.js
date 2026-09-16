/**
 * Routes for the global CAPS reference data (MY-45).
 * Read-only. Authenticated, but not school-scoped - this data is global.
 */
import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { getSubjects } from '../controllers/capsController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/subjects', getSubjects);

export default router;
