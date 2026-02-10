import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

// Server-specific config that excludes browser-only providers
// Note: We don't include authInterceptor here to avoid Router/document access during SSR
// provideServerRendering() automatically provides server-safe DOCUMENT from index.server.html
// DO NOT manually provide DOCUMENT - it conflicts with Angular's SSR system
export const config: ApplicationConfig = {
  providers: [
    // Provide server rendering FIRST - this sets up server-safe DOCUMENT from index.server.html
    // This is critical - Angular needs the actual document structure to find <app-root>
    // Let Angular handle DOCUMENT - don't override it
    provideServerRendering(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled' })
    ),
    provideHttpClient(withFetch()), // No interceptors on server to avoid SSR issues
    provideNoopAnimations() // Use noop animations on server to avoid SSR issues
  ]
};
