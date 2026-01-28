import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../_services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Get the token from auth service
  const token = authService.getToken();

  // Clone the request and add the Authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Check if this is a public events request or if we're on events page
  const isPublicEventsRequest = req.url.includes('/events') && !req.headers.has('Authorization');
  const isOnEventsPage = router.url.includes('/events');

  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 Unauthorized, clear token and redirect to login
      // But skip redirect for public events requests or when already on events page
      if (error.status === 401 && !isPublicEventsRequest && !isOnEventsPage) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
