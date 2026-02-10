// Polyfills for SSR - must be imported before any Angular code
// This sets up window and document mocks that Angular Router and other services need
// Note: global is already declared in Node.js types, no need to redeclare

// Set up window mock FIRST - Angular Router's Location service needs this immediately
// It accesses window.addEventListener during module initialization
if (typeof global !== 'undefined') {
  if (typeof global.window === 'undefined') {
    const windowMock: any = {
      addEventListener: () => {}, // No-op for SSR
      removeEventListener: () => {}, // No-op for SSR
      location: {
        href: '',
        pathname: '/',
        search: '',
        hash: '',
        hostname: '',
        port: '',
        protocol: 'http:'
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
      scrollTo: () => {},
      open: () => null
    };
    global.window = windowMock;
  }
}
