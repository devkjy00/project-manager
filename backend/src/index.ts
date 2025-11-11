import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { serveStatic } from '@hono/node-server/serve-static';
import { projectsRouter } from './routes/projects.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', secureHeaders());

// API Routes
app.route('/api/projects', projectsRouter);

// Serve static files (React build)
app.use('/*', serveStatic({ root: './frontend/dist' }));

// Fallback to index.html for client-side routing
app.get('*', serveStatic({ path: './frontend/dist/index.html' }));

const port = Number(process.env.PORT) || 3000;

console.log(`
╔════════════════════════════════════════════════════════════════╗
║              PROJECT DASHBOARD SERVER (v2.0)                   ║
╚════════════════════════════════════════════════════════════════╝

🚀 Server is running on: http://localhost:${port}

📊 Backend: Hono + TypeScript
🎨 Frontend: React 19 + Vite + TailwindCSS

Press Ctrl+C to stop the server
`);

serve({
  fetch: app.fetch,
  port,
});
