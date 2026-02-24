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
import { LoginModalService } from '../_services/login-modal.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private authDialogService: AuthDialogService,
    private loginModalService: LoginModalService
  ) {}

  /** Global handling: clear session, redirect to home, open login. Use when refresh fails or retry gets 401. */
  private doGlobalLogoutAndRedirect(): void {
    this.authService.clearSessionLocally();
    this.router.navigate(['/home']);
    this.loginModalService.open('login');
  }

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
          isBrowser
        ) {
          // Dialog already open: another request got 401 while user is choosing or we're refreshing.
          // Don't propagate to component — avoid page error; global logout/redirect will happen from the first request's flow.
          if (this.authDialogService.isOpen) {
            return EMPTY;
          }

          if (isRegistrationRequest && !token) {
            return throwError(() => this.normalizeNetworkError(error));
          }

          const choice$ = this.authDialogService.open();

          return choice$.pipe(
            take(1),
            switchMap((choice) => {
              if (choice === 'refresh') {
                const hasRefreshToken = !!this.authService.getRefreshToken();
                if (!hasRefreshToken) {
                  this.doGlobalLogoutAndRedirect();
                  return EMPTY;
                }
                return this.authService.refreshToken().pipe(
                  switchMap((tokenResponse) => {
                    const newToken = tokenResponse.accessToken;
                    if (newToken) {
                      const retryReq = req.clone({
                        setHeaders: {
                          Authorization: `Bearer ${newToken}`,
                        },
                      });
                      return next.handle(retryReq).pipe(
                        catchError((retryErr: HttpErrorResponse) => {
                          if (retryErr?.status === 401) {
                            this.doGlobalLogoutAndRedirect();
                            return EMPTY;
                          }
                          return throwError(() => this.normalizeNetworkError(retryErr));
                        })
                      );
                    }
                    this.doGlobalLogoutAndRedirect();
                    return EMPTY;
                  }),
                  catchError(() => {
                    this.doGlobalLogoutAndRedirect();
                    return EMPTY;
                  })
                );
              } else if (choice === 'logout') {
                this.authService.logout().subscribe();
                return EMPTY;
              }
              return throwError(() => this.normalizeNetworkError(error));
            })
          );
        }
        return throwError(() => this.normalizeNetworkError(error));
      })
    );
  }

  /** Transform "Failed to fetch" and network errors to user-friendly Hebrew message */
  private normalizeNetworkError(error: HttpErrorResponse): HttpErrorResponse {
    const isNetworkError =
      error.status === 0 ||
      (typeof error?.message === 'string' &&
        (error.message.toLowerCase().includes('failed to fetch') ||
          error.message.toLowerCase().includes('networkerror') ||
          error.message.toLowerCase().includes('load failed')));
    if (isNetworkError) {
      return new HttpErrorResponse({
        error: { message: 'השרות לא זמין כרגע, אנא נסה מאוחר יותר' },
        status: error.status,
        statusText: error.statusText,
        url: error.url ?? undefined
      });
    }
    return error;
  }
}

export const authInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptor,
  multi: true,
};
