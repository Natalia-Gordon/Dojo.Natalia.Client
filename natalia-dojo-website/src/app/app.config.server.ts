import { ApplicationConfig, PLATFORM_ID } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { DOCUMENT, isPlatformServer } from '@angular/common';
import { routes } from './app.routes';

// Server-specific config that excludes browser-only providers
// Note: We don't include authInterceptor here to avoid Router/document access during SSR
export const config: ApplicationConfig = {
  providers: [
    // Provide server rendering FIRST - this sets up server-safe providers
    provideServerRendering(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled' })
    ),
    provideHttpClient(withFetch()), // No interceptors on server to avoid SSR issues
    provideNoopAnimations(), // Use noop animations on server to avoid SSR issues
    // Explicitly provide DOCUMENT with server-safe implementation
    // This must be provided AFTER provideServerRendering() to override if needed
    {
      provide: DOCUMENT,
      useFactory: (platformId: Object) => {
        if (isPlatformServer(platformId)) {
          // Return a minimal server-safe document object
          return {
            body: {
              classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
              style: {},
              appendChild: () => {},
              removeChild: () => {}
            },
            documentElement: { style: {} },
            head: { appendChild: () => {}, querySelector: () => null, querySelectorAll: () => [] },
            createElement: () => ({ style: {}, setAttribute: () => {}, getAttribute: () => null, classList: { add: () => {}, remove: () => {} } }),
            querySelector: () => null,
            querySelectorAll: () => [],
            getElementById: () => null,
            getElementsByTagName: () => [],
            getElementsByClassName: () => [],
            location: { href: '', pathname: '', search: '', hash: '' }
          } as any;
        }
        // Fallback (shouldn't be reached in server config, but TypeScript needs it)
        return null as any;
      },
      deps: [PLATFORM_ID]
    }
  ]
};
