// Custom LocationStrategy for SSR that doesn't access window
// This prevents "window is not defined" errors during SSR
import { Injectable, Inject, Optional } from '@angular/core';
import { LocationStrategy, PathLocationStrategy, PlatformLocation, DOCUMENT } from '@angular/common';

@Injectable()
export class ServerLocationStrategy extends PathLocationStrategy {
  constructor(
    platformLocation: PlatformLocation,
    @Optional() @Inject(DOCUMENT) document: any
  ) {
    super(platformLocation, document);
  }

  // Override onPopState to prevent window access during SSR
  // The default implementation tries to access window.addEventListener
  override onPopState(fn: (value: any) => void): void {
    // No-op on server - popstate events don't exist during SSR
    // The browser will handle this after hydration
    // This prevents "Cannot read properties of undefined (reading 'addEventListener')" error
  }

  // Override getBaseHref to ensure it returns a string
  override getBaseHref(): string {
    try {
      const baseHref = super.getBaseHref();
      return typeof baseHref === 'string' ? baseHref : '/';
    } catch {
      return '/';
    }
  }

  // Override prepareExternalUrl to ensure it handles non-string values safely
  override prepareExternalUrl(internal: string): string {
    try {
      if (typeof internal !== 'string') {
        internal = String(internal || '');
      }
      return super.prepareExternalUrl(internal);
    } catch {
      return internal || '/';
    }
  }
}
