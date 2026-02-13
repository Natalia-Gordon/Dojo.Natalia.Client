import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, switchMap, take, throwError, EMPTY } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { AuthDialogService } from '../_services/auth-dialog.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private authDialogService: AuthDialogService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isBrowser = isPlatformBrowser(this.platformId);
    const token = this.authService.getToken();

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    const isPublicEventsListRequest =
      req.url.includes('/events') &&
      req.method === 'GET' &&
      !req.url.includes('/events/') &&
      !req.url.includes('/registrations') &&
      !req.headers.has('Authorization');
    const isRefreshTokenRequest = req.url.includes('/refresh-token');
    const isRegistrationRequest = req.url.includes('/registrations');

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (
          error.status === 401 &&
          !isPublicEventsListRequest &&
          !isRefreshTokenRequest &&
          isBrowser &&
          this.authDialogService
        ) {
          if (!this.authDialogService.isOpen) {
            if (isRegistrationRequest && !token) {
              return throwError(() => error);
            }

            const hasRefreshToken = !!this.authService.getRefreshToken();

            if (!hasRefreshToken) {
              this.authService.logout().subscribe();
              return EMPTY;
            }

            const choice$ = this.authDialogService.open();

            return choice$.pipe(
              take(1),
              switchMap((choice) => {
                if (choice === 'refresh') {
                  return this.authService.refreshToken().pipe(
                    switchMap((tokenResponse) => {
                      const newToken = tokenResponse.accessToken;
                      if (newToken) {
                        const retryReq = req.clone({
                          setHeaders: {
                            Authorization: `Bearer ${newToken}`,
                          },
                        });
                        return next.handle(retryReq);
                      }
                      return throwError(() => new Error('Failed to refresh token'));
                    }),
                    catchError((refreshError) => {
                      this.authService.logout().subscribe();
                      return throwError(() => refreshError);
                    })
                  );
                } else if (choice === 'logout') {
                  this.authService.logout().subscribe();
                  return EMPTY;
                }
                return throwError(() => error);
              })
            );
          }
        }
        return throwError(() => error);
      })
    );
  }
}

export const authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true,
};
