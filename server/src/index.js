import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRouter from './routes/health.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.use('/health', healthRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

// Global error handler.
// NEVER leak stack traces to the client (see docs/ARCHITECTURE.md).
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: 'internal_error' });
});

const port = process.env.PORT ?? 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.warn(`myATLAS server listening on :${port}`);
  });
}

export default app;
