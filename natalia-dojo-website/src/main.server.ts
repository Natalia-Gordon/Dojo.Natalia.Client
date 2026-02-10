// Mock document globally for SSR before any Angular code runs
if (typeof document === 'undefined') {
  const mockBody = {
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
    style: {},
    appendChild: () => {},
    removeChild: () => {},
    insertBefore: () => {},
    replaceChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByTagName: () => [],
    getElementsByClassName: () => [],
    getElementsByName: () => []
  };
  
  const mockHead = {
    appendChild: () => {},
    insertBefore: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByTagName: () => [],
    getElementsByClassName: () => []
  };
  
  (global as any).document = {
    body: mockBody,
    documentElement: { 
      style: {},
      setAttribute: () => {},
      getAttribute: () => null
    },
    head: mockHead,
    createElement: (tag: string) => ({
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      classList: { add: () => {}, remove: () => {} },
      tagName: tag,
      appendChild: () => {},
      removeChild: () => {}
    }),
    createTextNode: () => ({}),
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
      protocol: '',
      origin: ''
    },
    defaultView: null,
    ownerDocument: null
  };
}

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
