import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/api';
import { authenticateToken } from './server/auth';
import { DB } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Ensure DB is initialized
  DB.loadDatabase?.() || DB.db;

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Global Auth Token Extraction Middleware
  app.use(authenticateToken);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Shahid Manani High School Educational Management System',
      time: new Date().toISOString(),
      onlineClassesEnabled: DB.getSettings().onlineClassesEnabled,
    });
  });

  // Direct ZIP download endpoints
  const zipPath = path.resolve(__dirname, 'AndishehSari_Complete_Project.zip');
  app.get(['/AndishehSari_Complete_Project.zip', '/download', '/api/download-project'], (_req, res) => {
    res.download(zipPath, 'AndishehSari_Complete_Project.zip', (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).send('خطا در دانلود فایل پروژه');
        }
      }
    });
  });

  // Mount API router
  app.use('/api', apiRouter);

  if (!isProd) {
    // Development mode: attach Vite dev server middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev middleware attached in development mode');
  } else {
    // Production mode: serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`📦 Serving static assets from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Andisheh Sari Portal running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
