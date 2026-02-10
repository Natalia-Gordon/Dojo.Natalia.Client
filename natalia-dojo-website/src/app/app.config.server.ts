import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './_interceptors/auth.interceptor';

// Server-specific config that excludes browser-only providers
export const config: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideServerRendering(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideNoopAnimations() // Use noop animations on server to avoid SSR issues
  ]
};
