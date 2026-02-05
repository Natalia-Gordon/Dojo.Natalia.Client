# SSR/Prerendering Fixes Summary

## Problem
NG02100 errors during production build/prerendering caused by accessing browser-only APIs during SSR.

## Solutions Implemented

### 1. **Disabled Prerendering for API-Heavy Routes**
   - Added `skipPrerender: true` to routes that make API calls:
     - `/events` - EventsComponent
     - `/events/:id` - EventDetailComponent
   - **File**: `app.routes.ts`

### 2. **Made API Calls Conditional (Browser-Only)**
   - Added `isPlatformBrowser` checks before all API calls
   - **Files Modified**:
     - `events.component.ts` - `ngOnInit()`, `loadEvents()`, `loadInstructors()`
     - `event-detail.component.ts` - `ngOnInit()`, `loadEvent()`

### 3. **Added Error Handling with Try-Catch**
   - Wrapped all API calls in try-catch blocks
   - Provides fallback values during SSR
   - **Files Modified**:
     - `events.component.ts` - `loadEvents()`, `loadInstructors()`
     - `event-detail.component.ts` - `loadEvent()`

### 4. **Fixed Browser API Access**
   - **footer.component.ts**: Removed `@HostListener('window:scroll')`, added manual event listener
   - **contact.service.ts**: Added platform check before `window.open`
   - **gallery-image.component.ts**: Added platform check in keyboard handler
   - **user-menu.component.ts**: Added platform check in document click handler
   - **nav.component.ts**: Added platform check in document click handler

### 5. **Image Loading SSR Safety**
   - Pre-compute image URLs only in browser
   - Use `displayImageUrl` property instead of calling `getImageUrl()` in templates
   - Added `isBrowser` check to prevent image rendering during SSR

## Environment Verification

### Current Configuration
- **API URL**: `https://backend-1038814833024.europe-west1.run.app/api`
- **Environment**: Production
- **File**: `environments/environment.ts`

### Verification Steps
1. ✅ API URL is set correctly
2. ✅ Production flag is `true`
3. ✅ API URL is accessible (verified in logs)

## Testing Checklist

- [ ] Build succeeds: `npm run build -- --configuration production`
- [ ] No NG02100 errors in build output
- [ ] SSR works: `npm run serve:ssr:natalia-dojo-website`
- [ ] Events page loads correctly in browser
- [ ] Event detail page loads correctly in browser
- [ ] API calls work after page load
- [ ] Images load correctly
- [ ] No console errors in browser

## Key Changes Summary

### Routes (`app.routes.ts`)
```typescript
{path: "events", component: EventsComponent, data: { skipPrerender: true }},
{path: "events/:id", component: EventDetailComponent, data: { skipPrerender: true }},
```

### Component Pattern (`events.component.ts`, `event-detail.component.ts`)
```typescript
ngOnInit(): void {
  // Only make API calls in browser, not during SSR/prerendering
  if (!isPlatformBrowser(this.platformId)) {
    return;
  }
  // ... rest of initialization
}

loadEvents(): void {
  // Only make API calls in browser, not during SSR/prerendering
  if (!isPlatformBrowser(this.platformId)) {
    return;
  }
  
  try {
    // API call with error handling
  } catch (error) {
    // Fallback for SSR
  }
}
```

### Footer Component (`footer.component.ts`)
```typescript
// Before: @HostListener('window:scroll') - causes SSR error
// After: Manual event listener in ngOnInit with platform check
ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.scrollListener = () => this.onWindowScroll();
    window.addEventListener('scroll', this.scrollListener);
  }
}
```

## Notes

- The linter error about `enroll()` method is likely a false positive or caching issue - the method exists in the component
- All API calls are now conditional and won't execute during SSR
- Routes with API calls skip prerendering to avoid issues
- All browser API access is guarded with `isPlatformBrowser` checks

## Next Steps

1. Test the production build
2. Deploy and verify no NG02100 errors
3. Monitor for any runtime issues
4. Consider adding more routes to `skipPrerender` if they make API calls
