import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'myatlas-server', time: new Date().toISOString() });
});

export default router;
