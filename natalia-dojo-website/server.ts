import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import bootstrap from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  // Verify index.server.html exists and contains app-root
  if (!existsSync(indexHtml)) {
    console.error(`ERROR: index.server.html not found at ${indexHtml}`);
    console.error('This file should be generated during build. Check your build configuration.');
  } else {
    const htmlContent = readFileSync(indexHtml, 'utf-8');
    if (!htmlContent.includes('<app-root>') && !htmlContent.includes('app-root')) {
      console.error(`ERROR: index.server.html does not contain <app-root> selector`);
      console.error('The file should contain <app-root></app-root> for Angular to bootstrap.');
    } else {
      console.log('✓ index.server.html found and contains app-root');
    }
  }

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
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl }
          // Note: provideServerRendering() in app.config.server.ts should handle DOCUMENT
          // The DOCUMENT is provided by CommonEngine from index.server.html automatically
          // We don't need to provide it here - Angular's SSR system handles it
        ],
      })
      .then((html) => res.send(html))
      .catch((err) => {
        // Log detailed error information for debugging
        console.error('SSR Error:', err);
        console.error('Error stack:', err.stack);
        console.error('Error message:', err.message);
        if (err.message && err.message.includes('document')) {
          console.error('Document access error detected. Check services/components for browser-only API usage.');
        }
        // Return error response instead of crashing
        res.status(500).send('Server-side rendering error. Please check server logs.');
      });
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
