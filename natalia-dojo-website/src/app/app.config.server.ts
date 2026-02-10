import { ApplicationConfig, PLATFORM_ID } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { DOCUMENT, Location, isPlatformServer } from '@angular/common';
import { routes } from './app.routes';

// Server-specific config that excludes browser-only providers
// Note: We don't include authInterceptor here to avoid Router/document access during SSR
export const config: ApplicationConfig = {
  providers: [
    // Provide server rendering FIRST - this automatically provides server-safe DOCUMENT
    // DO NOT override DOCUMENT here as provideServerRendering() handles it correctly
    provideServerRendering(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled' })
    ),
    provideHttpClient(withFetch()), // No interceptors on server to avoid SSR issues
    provideNoopAnimations() // Use noop animations on server to avoid SSR issues
  ]
};
