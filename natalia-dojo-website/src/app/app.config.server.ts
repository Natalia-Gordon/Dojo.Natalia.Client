import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';
import { routes } from './app.routes';
import { ServerLocationStrategy } from './location-strategy.server';

// Server-specific config that excludes browser-only providers
// Note: We don't include authInterceptor here to avoid Router/document access during SSR
// provideServerRendering() automatically provides server-safe DOCUMENT from index.server.html
// IMPORTANT: We provide a custom LocationStrategy that doesn't access window during SSR
export const config: ApplicationConfig = {
  providers: [
    // Provide server rendering FIRST - this sets up server-safe DOCUMENT from index.server.html
    // This is critical - Angular needs the actual document structure to find <app-root>
    provideServerRendering(),
    // Provide custom LocationStrategy that doesn't access window during SSR
    { provide: LocationStrategy, useClass: ServerLocationStrategy },
    provideRouter(routes),
    provideHttpClient(withFetch()), // No interceptors on server to avoid SSR issues
    provideNoopAnimations() // Use noop animations on server to avoid SSR issues
  ]
};
