import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  
  // Serve static files from /browser (assets, JS, CSS, images, etc.)
  // This must come before the catch-all route
  server.use(express.static(browserDistFolder, {
    maxAge: '1y',
    index: false
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    // Skip API routes - return 404 since API should be handled by backend
    // Check both with and without leading slash
    const path = req.path;
    if (path.startsWith('/api/') || path.startsWith('api/')) {
      res.status(404).send('API endpoint not found on this server');
      return;
    }
    
    // If this is a static file request that wasn't handled by express.static,
    // return 404 instead of trying to render it as an Angular route
    if (path.match(/\.(js|css|map|ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|json)$/)) {
      res.status(404).send('File not found');
      return;
    }
    
    const { protocol, originalUrl, baseUrl, headers } = req;
    
    // Additional check: ensure the URL doesn't contain API paths
    // This prevents Angular router from trying to handle API endpoints during SSR
    if (originalUrl.includes('/api/') || originalUrl.startsWith('api/')) {
      res.status(404).send('API endpoint not found on this server');
      return;
    }

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = Number(process.env['PORT']) || 4000;
  const host = process.env['HOST'] || '0.0.0.0';

  // Start up the Node server
  const server = app();
  server.listen(port, host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
  });
}

run();
