# Angular Upgrade Checklist

## Pre-Upgrade Checklist

- [ ] **Backup current code**
  ```bash
  git checkout -b upgrade/angular-19
  git commit -am "Backup before upgrade"
  ```

- [ ] **Update Node.js to LTS version**
  - Current: v25.6.0 (odd - not recommended)
  - Target: Node.js 20.x or 22.x LTS
  ```bash
  nvm install 20
  nvm use 20
  ```

- [ ] **Review current dependencies**
  ```bash
  npm outdated
  ```

- [ ] **Check for security vulnerabilities**
  ```bash
  npm audit
  ```

---

## Upgrade Steps Checklist

### Phase 1: Angular 18 Upgrade

- [ ] Update Angular CLI globally
  ```bash
  npm install -g @angular/cli@18
  ```

- [ ] Update Angular core packages
  ```bash
  ng update @angular/core@18 @angular/cli@18
  ```

- [ ] Update all Angular packages
  ```bash
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
  ```

- [ ] Update build tools
  ```bash
  ng update @angular-devkit/build-angular@18 \
            @angular/compiler-cli@18
  ```

- [ ] Test build
  ```bash
  npm run build
  ```

- [ ] Test SSR
  ```bash
  npm run build
  npm run serve:ssr:natalia-dojo-website
  ```

### Phase 2: Angular 19 Upgrade

- [ ] Update Angular CLI globally
  ```bash
  npm install -g @angular/cli@19
  ```

- [ ] Update Angular core packages
  ```bash
  ng update @angular/core@19 @angular/cli@19
  ```

- [ ] Update all Angular packages
  ```bash
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
  ```

- [ ] Update build tools
  ```bash
  ng update @angular-devkit/build-angular@19 \
            @angular/compiler-cli@19
  ```

### Phase 3: Dependency Updates

- [ ] Update TypeScript
  ```bash
  npm install --save-dev typescript@~5.6.0
  ```

- [ ] Update RxJS
  ```bash
  npm install rxjs@~7.8.1
  ```

- [ ] Update Zone.js
  ```bash
  npm install zone.js@~0.15.0
  ```

- [ ] **Update @ng-bootstrap (CRITICAL)**
  ```bash
  npm install @ng-bootstrap/ng-bootstrap@19
  ```
  - [ ] Review breaking changes
  - [ ] Update component templates if needed
  - [ ] Test all modals, dropdowns, tooltips

- [ ] Update Bootstrap
  ```bash
  npm install bootstrap@^5.3.3
  ```

- [ ] Update other dependencies
  ```bash
  npm install bootstrap-icons@^1.11.3
  npm install @popperjs/core@^2.11.8
  ```

### Phase 4: Code Migration

- [ ] **Run control flow migration**
  ```bash
  ng generate @angular/core:control-flow
  ```
  - [ ] Review migrated templates
  - [ ] Test all components with `@if`, `@for`, `@switch`

- [ ] **Update @ng-bootstrap components**
  - [ ] Check all modal usages
  - [ ] Check all dropdown usages
  - [ ] Check all tooltip usages
  - [ ] Update deprecated APIs

- [ ] **Review RxJS patterns**
  - [ ] Check for deprecated operators
  - [ ] Update to pipeable operators if needed

- [ ] **Verify SSR compatibility**
  - [ ] All `isPlatformBrowser` checks still work
  - [ ] Prerendering works correctly
  - [ ] No NG02100 errors

---

## Testing Checklist

### Build Tests

- [ ] Development build
  ```bash
  npm run build
  ```

- [ ] Production build
  ```bash
  npm run build -- --configuration production
  ```

- [ ] SSR build
  ```bash
  npm run build
  npm run serve:ssr:natalia-dojo-website
  ```

### Functional Tests

- [ ] **Authentication**
  - [ ] Login works
  - [ ] Logout works
  - [ ] Token refresh works
  - [ ] Auth interceptor works

- [ ] **Events**
  - [ ] Event list loads
  - [ ] Event detail page loads
  - [ ] Event registration works
  - [ ] File upload works (payment proof)
  - [ ] Event creation works (admin)

- [ ] **Forms**
  - [ ] All forms submit correctly
  - [ ] Validation works
  - [ ] Error messages display

- [ ] **Images**
  - [ ] Google Drive images load
  - [ ] Image fallbacks work
  - [ ] No SSR errors

- [ ] **Navigation**
  - [ ] All routes work
  - [ ] Router navigation works
  - [ ] Back button works

- [ ] **Modals/Dialogs**
  - [ ] Registration dialog works
  - [ ] Auth dialog works
  - [ ] All modals open/close correctly

- [ ] **SSR/Prerendering**
  - [ ] No NG02100 errors
  - [ ] All pages prerender correctly
  - [ ] Hydration works

### Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

---

## Post-Upgrade Checklist

- [ ] **Code Review**
  - [ ] Review all changes
  - [ ] Check for deprecated APIs
  - [ ] Update documentation if needed

- [ ] **Performance**
  - [ ] Build time is acceptable
  - [ ] Bundle size is reasonable
  - [ ] Runtime performance is good

- [ ] **Documentation**
  - [ ] Update README if needed
  - [ ] Document any breaking changes
  - [ ] Update deployment docs

- [ ] **Deployment**
  - [ ] Test in staging environment
  - [ ] Deploy to production
  - [ ] Monitor for errors

---

## Rollback Plan

If critical issues occur:

```bash
# Revert to backup branch
git checkout upgrade/angular-19-backup

# Or restore from main
git checkout main
git branch -D upgrade/angular-19
```

---

## Notes

- ⚠️ **@ng-bootstrap** is 3 major versions behind - this is the biggest risk
- ⚠️ **Node.js v25.6.0** is odd version - should use LTS
- ✅ Already using **standalone components** - good!
- ✅ Already using **inject()** - good!
- ✅ Already using **modern providers** - good!

---

## Resources

- [Angular Update Guide](https://update.angular.io/)
- [Angular 19 Release Notes](https://github.com/angular/angular/releases)
- [@ng-bootstrap Migration Guide](https://ng-bootstrap.github.io/#/migration)
- [Angular Control Flow](https://angular.dev/guide/control-flow)
