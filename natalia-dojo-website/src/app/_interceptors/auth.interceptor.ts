import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, take, throwError, EMPTY, of } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { AuthDialogService } from '../_services/auth-dialog.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const authDialogService = inject(AuthDialogService);

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

  // Check if this is a public events list request (GET /events without auth, not a specific event)
  const isPublicEventsListRequest = req.url.includes('/events') && 
                                    req.method === 'GET' && 
                                    !req.url.includes('/events/') && // Not a specific event (e.g., /events/1)
                                    !req.url.includes('/registrations') && // Not registration endpoint
                                    !req.headers.has('Authorization');
  const isRefreshTokenRequest = req.url.includes('/refresh-token');
  const isRegistrationRequest = req.url.includes('/registrations');
  
  // Handle the request and catch errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If we get a 401 Unauthorized, show dialog to user
      // But skip for public events list requests and refresh token requests
      if (error.status === 401 && !isPublicEventsListRequest && !isRefreshTokenRequest) {
        // Check if dialog is already open to avoid multiple dialogs
        if (!authDialogService.isOpen) {
          // For registration requests without token, let the component handle it (show login modal)
          if (isRegistrationRequest && !token) {
            return throwError(() => error);
          }
          
          // Check if user has a refresh token available
          const hasRefreshToken = !!authService.getRefreshToken();
          
          if (!hasRefreshToken) {
            // No refresh token available, just logout
            authService.logout().subscribe();
            return EMPTY;
          }
          
          // Open dialog and wait for user's choice
          const choice$ = authDialogService.open();
          
          return choice$.pipe(
            take(1),
            switchMap((choice) => {
              if (choice === 'refresh') {
                // Try to refresh the token
                return authService.refreshToken().pipe(
                  switchMap((tokenResponse) => {
                    // Retry the original request with new token
                    const newToken = tokenResponse.accessToken;
                    if (newToken) {
                      const retryReq = req.clone({
                        setHeaders: {
                          Authorization: `Bearer ${newToken}`
                        }
                      });
                      return next(retryReq);
                    }
                    return throwError(() => new Error('Failed to refresh token'));
                  }),
                  catchError((refreshError) => {
                    // If refresh fails, logout
                    authService.logout().subscribe();
                    return throwError(() => refreshError);
                  })
                );
              } else if (choice === 'logout') {
                // User chose to logout
                authService.logout().subscribe();
                return EMPTY;
              }
              // Should not reach here, but return error just in case
              return throwError(() => error);
            })
          );
        }
        // If dialog is already open, just return the error
        // The first request that opened the dialog will handle the user's choice
      }
      return throwError(() => error);
    })
  );
};
