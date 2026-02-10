import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { routes } from './app.routes';

// Server-specific config that excludes browser-only providers
// Note: We don't include authInterceptor here to avoid Router/document access during SSR
export const config: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideServerRendering(), // This should provide server-safe DOCUMENT automatically
    provideHttpClient(withFetch()), // No interceptors on server to avoid SSR issues
    provideNoopAnimations() // Use noop animations on server to avoid SSR issues
  ]
};
