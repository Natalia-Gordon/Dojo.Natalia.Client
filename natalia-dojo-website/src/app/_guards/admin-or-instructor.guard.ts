import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';

/**
 * Guard for routes that require admin or instructor role.
 * Used for /events/create so direct URL access redirects to /events when not allowed.
 */
export const adminOrInstructorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const userInfo = auth.getUserInfo();
  const role = (userInfo?.role ?? '').toLowerCase();
  const allowed = role === 'admin' || role === 'instructor';
  if (allowed) return true;
  return router.createUrlTree(['/events']);
};
