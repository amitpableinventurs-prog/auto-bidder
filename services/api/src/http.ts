import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

  app.set('trust proxy', 1); // Trust first proxy (e.g. Nginx, Heroku, Cloudflare)
  app.disable('x-powered-by');

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable if you have issues with admin panel or web build
    crossOriginEmbedderPolicy: false,
  }));

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Requests from native mobile apps have no Origin header.
        if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
          return callback(null, true);
        }
        console.warn(`[CORS REJECTED] Origin: ${origin}. Whitelist: ${corsOrigins.join(', ')}`);
        return callback(new Error(`Origin ${origin} is not allowed by CORS. Please update your environment configuration.`));
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
    if (env.AUTO_BIDDER_STORE !== 'database') return res.json({ ok: true, store: 'memory' });
    try {
      await prisma.$queryRaw`SELECT 1`;
      return res.json({ ok: true, store: 'database' });
    } catch {
      return res.status(503).json({ ok: false, error: 'Database unavailable' });
    }
  });

  app.get('/admin', (_req, res) => {
    res.type('html').send(renderAdminPanel());
  });

  app.use('/api', createApiRouter());

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // Standard error response
    let statusCode = 500;
    let message = 'Internal server error';
    let details: any = undefined;

    if (err && typeof err === 'object' && 'issues' in err) {
      statusCode = 400;
      const issues = (err as { issues: any[] }).issues;
      message = `Validation failed: ${issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`;
      details = issues;
      // Log validation errors for debugging
      console.error(`[VALIDATION ERROR] Path: ${_req.path}`, JSON.stringify(details, null, 2));
    } else if (err instanceof Error) {
      if (err.name === 'MulterError') {
        statusCode = 400;
        message = `Upload error: ${err.message}`;
      } else {
        message = err.message;
      }
    }

    // eslint-disable-next-line no-console
    console.error(`[SERVER ERROR]`, err);

    return res.status(statusCode).json({
      success: false,
      error: message,
      details: env.NODE_ENV !== 'production' ? details || (err instanceof Error ? err.stack : undefined) : details,
    });
  });

  return app;
}
