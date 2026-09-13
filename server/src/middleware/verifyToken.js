import { verifyAccessToken } from '../lib/jwt.js';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization Header' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({ error: 'Malformed Authorization Header' });
  }

  const token = parts[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; //{userId, schoolId, role}
    req.schoolId = decoded.schoolId; //schoolId set directly from the JWT payload for easy access in route handlers
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
}
