// Polyfills for SSR - must be imported before any Angular code
// This sets up window and document mocks that Angular Router and other services need
// CRITICAL: This must run at module load time, before any imports execute

// Set up window mock FIRST - Angular Router's Location service needs this immediately
// It accesses window.addEventListener during module initialization
// We need to make it available both as global.window AND as a direct window reference
(function setupWindowMock() {
  if (typeof global === 'undefined') return;
  
  // Create comprehensive window mock
  const windowMock: any = {
    addEventListener: function(type: string, listener: any, options?: any) {
      // No-op for SSR - events don't exist on server
      return;
    },
    removeEventListener: function(type: string, listener: any, options?: any) {
      // No-op for SSR
      return;
    },
    location: {
      href: '',
      pathname: '/',
      search: '',
      hash: '',
      hostname: '',
      port: '',
      protocol: 'http:',
      origin: 'http://localhost',
      host: 'localhost'
    },
    history: {
      pushState: () => {},
      replaceState: () => {},
      go: () => {},
      back: () => {},
      forward: () => {},
      length: 1,
      state: null,
      scrollRestoration: 'auto' as any
    },
    navigator: {
      userAgent: 'SSR'
    } as any,
    innerWidth: 1920,
    innerHeight: 1080,
    pageYOffset: 0,
    scrollX: 0,
    scrollY: 0,
    scrollTo: () => {},
    open: () => null,
    getComputedStyle: () => ({
      getPropertyValue: () => ''
    })
  };

  // Set on global object
  (global as any).window = windowMock;
  
  // Also try to set as direct window reference if possible (for code that accesses window directly)
  try {
    (global as any).window = windowMock;
    // Make it non-configurable to prevent overwrites
    Object.defineProperty(global, 'window', {
      value: windowMock,
      writable: true,
      configurable: true
    });
  } catch (e) {
    // If we can't define it, just set it
    (global as any).window = windowMock;
  }
})();
