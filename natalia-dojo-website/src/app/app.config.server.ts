import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { routes } from './app.routes';

// Server-specific config that excludes browser-only providers
// Note: We don't include authInterceptor here to avoid Router/document access during SSR
export const config: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideServerRendering(),
    provideHttpClient(withFetch()), // No interceptors on server to avoid SSR issues
    provideNoopAnimations(), // Use noop animations on server to avoid SSR issues
    // Provide a server-safe DOCUMENT token to prevent "document is not defined" errors
    {
      provide: DOCUMENT,
      useFactory: () => {
        // Return a minimal document-like object for server-side rendering
        // This prevents services from trying to access the real document object
        return {
          body: {
            classList: {
              add: () => {},
              remove: () => {},
              contains: () => false,
              toggle: () => {}
            },
            style: {},
            appendChild: () => {},
            removeChild: () => {}
          },
          documentElement: {
            style: {}
          },
          head: {
            appendChild: () => {},
            querySelector: () => null,
            querySelectorAll: () => []
          },
          createElement: () => ({
            style: {},
            setAttribute: () => {},
            getAttribute: () => null,
            classList: {
              add: () => {},
              remove: () => {}
            }
          }),
          querySelector: () => null,
          querySelectorAll: () => [],
          getElementById: () => null,
          getElementsByTagName: () => [],
          getElementsByClassName: () => [],
          location: {
            href: '',
            pathname: '',
            search: '',
            hash: ''
          }
        } as any;
      }
    }
  ]
};
