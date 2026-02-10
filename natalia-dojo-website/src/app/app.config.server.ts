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
    // Provide server rendering FIRST - this sets up the SSR environment
    provideServerRendering(),
    // Explicitly provide DOCUMENT to ensure it's available before any services try to use it
    // This is needed because some services (like Title/Meta) may access document during initialization
    {
      provide: DOCUMENT,
      useFactory: (platformId: Object) => {
        if (isPlatformServer(platformId)) {
          // Return a server-safe document mock that supports all common DOM operations
          const createMockElement = (tagName: string) => ({
            tagName,
            style: {},
            classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
            setAttribute: () => {},
            getAttribute: () => null,
            removeAttribute: () => {},
            appendChild: () => {},
            removeChild: () => {},
            insertBefore: () => {},
            querySelector: () => null,
            querySelectorAll: () => [],
            getElementsByTagName: () => [],
            getElementsByClassName: () => [],
            innerHTML: '',
            textContent: '',
            innerText: ''
          });
          
          const mockBody = createMockElement('body');
          const mockHead = createMockElement('head');
          
          // Add query methods to body and head
          (mockBody as any).querySelector = () => null;
          (mockBody as any).querySelectorAll = () => [];
          (mockHead as any).querySelector = () => null;
          (mockHead as any).querySelectorAll = () => [];
          
          return {
            body: mockBody,
            head: mockHead,
            documentElement: createMockElement('html'),
            createElement: createMockElement,
            createTextNode: () => ({ textContent: '', nodeValue: '' }),
            querySelector: () => null,
            querySelectorAll: () => [],
            getElementById: () => null,
            getElementsByTagName: () => [],
            getElementsByClassName: () => [],
            getElementsByName: () => [],
            location: {
              href: '',
              pathname: '',
              search: '',
              hash: '',
              host: '',
              hostname: '',
              port: '',
              protocol: 'http:',
              origin: ''
            },
            defaultView: null,
            ownerDocument: null
          } as any;
        }
        return null as any;
      },
      deps: [PLATFORM_ID]
    },
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled' })
    ),
    provideHttpClient(withFetch()), // No interceptors on server to avoid SSR issues
    provideNoopAnimations() // Use noop animations on server to avoid SSR issues
  ]
};
