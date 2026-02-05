# Angular Upgrade Plan: 17.1.0 → Latest (19.x)

## Current State Analysis

### Current Versions
- **Angular Core**: 17.1.0
- **Angular CLI**: 17.1.1
- **TypeScript**: 5.3.2
- **RxJS**: 7.8.0
- **Zone.js**: 0.14.3
- **@ng-bootstrap**: 16.0.0 (⚠️ **OUTDATED** - needs upgrade to 19.x)
- **Node.js**: v25.6.0 (⚠️ **ODD VERSION** - should use LTS)

### Architecture Assessment
✅ **Good News:**
- Already using **standalone components** (modern approach)
- Using **inject()** function (modern DI)
- Using **provideRouter**, **provideHttpClient** (modern providers)
- SSR configured with `@angular/ssr`
- TypeScript strict mode enabled

⚠️ **Potential Issues:**
- `@ng-bootstrap` is on v16 (2 major versions behind)
- Using older RxJS patterns (may need updates)
- Some components may need control flow migration (@if, @for, @switch)

---

## Upgrade Path

### Phase 1: Preparation (Before Upgrade)

1. **Backup & Version Control**
   ```bash
   git checkout -b upgrade/angular-19
   git commit -am "Backup before Angular 19 upgrade"
   ```

2. **Update Node.js to LTS**
   - Current: v25.6.0 (odd version - not recommended)
   - Recommended: **Node.js 20.x LTS** or **Node.js 22.x LTS**
   ```bash
   # Use nvm to switch versions
   nvm install 20
   nvm use 20
   ```

3. **Clean Install**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

### Phase 2: Angular Core Upgrade (17 → 18 → 19)

#### Step 1: Upgrade to Angular 18
```bash
# Update Angular CLI first
npm install -g @angular/cli@latest

# Update Angular core packages
ng update @angular/core@18 @angular/cli@18

# Update all Angular packages
ng update @angular/animations@18 \
          @angular/common@18 \
          @angular/compiler@18 \
          @angular/forms@18 \
          @angular/platform-browser@18 \
          @angular/platform-browser-dynamic@18 \
          @angular/platform-server@18 \
          @angular/router@18 \
          @angular/ssr@18 \
          @angular/localize@18

# Update build tools
ng update @angular-devkit/build-angular@18 \
          @angular/compiler-cli@18
```

#### Step 2: Upgrade to Angular 19
```bash
# Update to Angular 19
ng update @angular/core@19 @angular/cli@19

# Update all Angular packages to 19
ng update @angular/animations@19 \
          @angular/common@19 \
          @angular/compiler@19 \
          @angular/forms@19 \
          @angular/platform-browser@19 \
          @angular/platform-browser-dynamic@19 \
          @angular/platform-server@19 \
          @angular/router@19 \
          @angular/ssr@19 \
          @angular/localize@19

# Update build tools
ng update @angular-devkit/build-angular@19 \
          @angular/compiler-cli@19
```

---

### Phase 3: Dependency Updates

#### 1. Update TypeScript
```bash
npm install --save-dev typescript@~5.6.0
```

#### 2. Update RxJS
```bash
npm install rxjs@~7.8.1
# Angular 19 may require RxJS 8.x - check compatibility
```

#### 3. Update Zone.js
```bash
npm install zone.js@~0.15.0
```

#### 4. Update @ng-bootstrap (CRITICAL)
```bash
# This is a major update - may require code changes
npm install @ng-bootstrap/ng-bootstrap@19
```

**⚠️ Breaking Changes in @ng-bootstrap 19:**
- May require template syntax updates
- Check migration guide: https://ng-bootstrap.github.io/#/migration

#### 5. Update Other Dependencies
```bash
npm install bootstrap@^5.3.3
npm install bootstrap-icons@^1.11.3
npm install @popperjs/core@^2.11.8
```

---

### Phase 4: Code Migration

#### 1. Control Flow Migration (Angular 17+)
Angular 19 uses new control flow syntax. Run the migration:

```bash
ng generate @angular/core:control-flow
```

This will automatically migrate:
- `*ngIf` → `@if`
- `*ngFor` → `@for`
- `*ngSwitch` → `@switch`

**Example Migration:**
```typescript
// Before (Angular 17)
<div *ngIf="event.imageUrl">
  <img [src]="displayImageUrl">
</div>

// After (Angular 19)
@if (event.imageUrl) {
  <img [src]="displayImageUrl">
}
```

#### 2. Update RxJS Patterns
Check for deprecated operators and update:
- `rxjs/operators` → `rxjs`
- Update to pipeable operators if needed

#### 3. Update @ng-bootstrap Components
Review all `@ng-bootstrap` usage:
- Check for deprecated APIs
- Update component imports if needed
- Test all modals, dropdowns, tooltips

#### 4. SSR Compatibility
Verify SSR still works:
```bash
npm run build
npm run serve:ssr:natalia-dojo-website
```

---

### Phase 5: Testing & Validation

#### 1. Build Tests
```bash
# Development build
npm run build

# Production build
npm run build -- --configuration production

# SSR build
npm run build
npm run serve:ssr:natalia-dojo-website
```

#### 2. Runtime Tests
- [ ] Test all routes
- [ ] Test authentication flow
- [ ] Test event registration
- [ ] Test file uploads
- [ ] Test SSR/prerendering
- [ ] Test all forms
- [ ] Test modals/dialogs
- [ ] Test image loading (Google Drive)

#### 3. Browser Compatibility
Test in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

---

## Breaking Changes to Watch For

### Angular 18 → 19

1. **Control Flow Syntax** (if not already migrated)
   - `*ngIf` → `@if`
   - `*ngFor` → `@for`
   - `*ngSwitch` → `@switch`

2. **Signals** (Optional but recommended)
   - Consider migrating to signals for reactive state
   - `signal()`, `computed()`, `effect()`

3. **Standalone Components** (Already using ✅)
   - No changes needed

4. **HttpClient**
   - `withFetch()` is now default in some cases
   - May need to adjust interceptors

5. **SSR Changes**
   - Verify `isPlatformBrowser` checks still work
   - Test prerendering

### @ng-bootstrap 16 → 19

1. **Component API Changes**
   - Check migration guide
   - May need template updates

2. **Bootstrap 5 Compatibility**
   - Ensure Bootstrap 5.3+ is used

---

## Rollback Plan

If issues occur:

```bash
# Revert to previous version
git checkout main
git branch -D upgrade/angular-19

# Or restore from backup
git checkout upgrade/angular-19
git revert HEAD
```

---

## Recommended Timeline

1. **Week 1**: Preparation & Angular 18 upgrade
2. **Week 2**: Angular 19 upgrade & dependency updates
3. **Week 3**: Code migration & testing
4. **Week 4**: Bug fixes & production deployment

---

## Useful Commands

```bash
# Check for outdated packages
npm outdated

# Check Angular version
ng version

# Verify build
ng build --configuration production

# Run tests
npm test

# Check for security vulnerabilities
npm audit

# Fix security issues (carefully)
npm audit fix
```

---

## Resources

- [Angular Update Guide](https://update.angular.io/)
- [Angular 19 Release Notes](https://github.com/angular/angular/releases)
- [@ng-bootstrap Migration Guide](https://ng-bootstrap.github.io/#/migration)
- [Angular Control Flow Migration](https://angular.dev/guide/control-flow)

---

## Notes

- **Always test in a separate branch**
- **Don't skip major versions** (17 → 18 → 19)
- **Update @ng-bootstrap carefully** - it's 3 major versions behind
- **Test SSR thoroughly** - you've had SSR issues before
- **Consider gradual migration** - upgrade one module at a time if needed
