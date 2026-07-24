import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { corsOrigins, env } from './env.js';
import { prisma } from './prisma.js';
import { renderAdminPanel } from './adminPanel.js';
import { createApiRouter } from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function createHttpApp() {
  const app = express();

  app.set('trust proxy', true);
  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        // Requests from native mobile apps have no Origin header.
        if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin is not allowed by CORS'));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));

  // Middleware to clean up "undefined" or "null" strings from query parameters
  app.use((req, _res, next) => {
    if (req.query) {
      for (const key in req.query) {
        if (req.query[key] === 'undefined' || req.query[key] === 'null') {
          delete req.query[key];
        }
      }
    }
    next();
  });

  app.use('/uploads', express.static(path.join(rootDir, 'uploads'), { index: false, maxAge: '1d' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'api', time: new Date().toISOString() });
  });

  app.get('/ready', async (_req, res) => {
    if (process.env.AUTO_BIDDER_STORE !== 'database') return res.json({ ok: true, store: 'memory' });
    try {
      await prisma.$queryRaw`SELECT 1`;
      return res.json({ ok: true, store: 'database' });
    } catch {
      return res.status(503).json({ ok: false, error: 'Database unavailable' });
    }
  });

  app.get('/admin', (req, res) => {
    const apiBaseUrl = env.ADMIN_API_URL || `${req.protocol}://${req.get('host')}`;
    res.type('html').send(renderAdminPanel(apiBaseUrl));
  });

  app.use('/api', createApiRouter());

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err && typeof err === 'object' && 'issues' in err) {
      return res.status(400).json({ error: 'Validation failed', details: (err as { issues: unknown }).issues });
    }

    // eslint-disable-next-line no-console
    console.error('SERVER ERROR:', err);

    if (err instanceof Error && err.name === 'MulterError') {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    return res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
