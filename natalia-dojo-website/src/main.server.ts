// Mock document globally for SSR before any Angular code runs
if (typeof document === 'undefined') {
  (global as any).document = {
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
  };
}

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
