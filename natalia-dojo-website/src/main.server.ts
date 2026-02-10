// Import polyfills FIRST to set up window before Angular code runs
import './polyfills.server';

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Set up minimal global document for SSR to prevent "document is not defined" errors
// This is needed because some services access document during DI initialization
// before provideServerRendering() can set it up. This is a minimal mock that will
// be replaced by Angular's SSR system with the actual document.
declare const global: any;

if (typeof global !== 'undefined' && typeof global.document === 'undefined') {
  // Create minimal document mock without using domino (which causes build errors)
  // This mock must include all methods that Angular SSR services might call
  // AND must include an app-root element so Angular can find it during bootstrap
  const emptyNodeList: any = [];
  emptyNodeList.forEach = () => {};
  emptyNodeList.length = 0;
  
  // Create a mock app-root element that Angular can find
  const appRootElement: any = {
    tagName: 'APP-ROOT',
    nodeName: 'APP-ROOT',
    nodeType: 1, // ELEMENT_NODE
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    removeChild: () => {},
    style: {},
    textContent: '',
    innerHTML: '',
    querySelector: () => null,
    querySelectorAll: () => emptyNodeList
  };
  
  const minimalDoc: any = {
    body: {
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      style: { overflow: '' },
      querySelector: (selector: string) => {
        // Return app-root when Angular looks for it
        if (selector === 'app-root' || selector === 'APP-ROOT') {
          return appRootElement;
        }
        return null;
      },
      querySelectorAll: () => emptyNodeList,
      getElementById: () => null,
      getElementsByTagName: (tag: string) => {
        if (tag === 'app-root' || tag === 'APP-ROOT') {
          return [appRootElement];
        }
        return emptyNodeList;
      },
      getElementsByClassName: () => emptyNodeList,
      appendChild: () => {},
      removeChild: () => {}
    },
    documentElement: {
      style: { scrollBehavior: '' },
      querySelector: (selector: string) => {
        if (selector === 'app-root' || selector === 'APP-ROOT') {
          return appRootElement;
        }
        return null;
      },
      querySelectorAll: () => emptyNodeList
    },
    head: {
      appendChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => emptyNodeList,
      getElementsByTagName: () => emptyNodeList,
      getElementsByClassName: () => emptyNodeList
    },
    createElement: (tag: string) => ({
      tagName: tag.toUpperCase(),
      nodeName: tag.toUpperCase(),
      nodeType: 1,
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      style: {},
      textContent: ''
    }),
    createTextNode: () => ({ textContent: '', nodeType: 3 }),
    createComment: (text: string) => ({ 
      nodeType: 8, // COMMENT_NODE
      textContent: text || '',
      nodeName: '#comment'
    }),
    querySelector: (selector: string) => {
      // Return app-root when Angular looks for it
      if (selector === 'app-root' || selector === 'APP-ROOT') {
        return appRootElement;
      }
      return null;
    },
    querySelectorAll: (selector: string) => {
      if (selector === 'app-root' || selector === 'APP-ROOT') {
        return [appRootElement];
      }
      return emptyNodeList;
    },
    getElementById: () => null,
    getElementsByTagName: (tag: string) => {
      if (tag === 'app-root' || tag === 'APP-ROOT') {
        return [appRootElement];
      }
      return emptyNodeList;
    },
    getElementsByClassName: () => emptyNodeList
  };
  
  // Link document to window
  if ((global as any).window) {
    (global as any).window.document = minimalDoc;
  }
  
  (global as any).document = minimalDoc;
}

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
