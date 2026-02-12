/**
 * This file is required for Karma. It loads the Angular testing environment
 * before any specs run, so that zone.js and Jasmine globals are available.
 */
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  { errorOnUnknownElements: true, errorOnUnknownProperties: true }
);
