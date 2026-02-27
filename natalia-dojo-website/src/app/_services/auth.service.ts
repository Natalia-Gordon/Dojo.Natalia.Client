import { Injectable, Inject, PLATFORM_ID, Optional } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { catchError, tap, take } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { AuthDialogService } from './auth-dialog.service';
import { LoginModalService } from './login-modal.service';

/** Show session-expired dialog this many ms before access token expiry. */
const SESSION_EXPIRY_WARN_BEFORE_MS = 60 * 1000;
const STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT = 'auth_token_expires_at';
const STORAGE_KEY_REFRESH_TOKEN_EXPIRES_AT = 'refresh_token_expires_at';

// Force explicit check - ensure we're using the correct environment
if (!environment.apiUrl) {
  console.error('CRITICAL: environment.apiUrl is undefined!');
}

export interface LoginRequest {
  identifier: string | null;
  password: string | null;
  deviceInfo?: string | null;
}

export interface CreateUserRequest {
  username?: string | null;
  email?: string | null;
  password?: string | null;
  userType?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  CurrentRankId?: number | null;
}

/** Matches API schema TokenResponse (accessTokenExpiresAt, refreshTokenExpiresAt are date-time ISO strings). */
export interface TokenResponse {
  userId: number;
  username: string | null;
  email: string | null;
  displayName: string | null;
  role: string | null;
  level: string | null;
  lastLoginAt?: string | null;
  accessToken: string | null;
  accessTokenExpiresAt: string;
  refreshToken: string | null;
  refreshTokenExpiresAt: string;
}

/** Request body for POST /api/users/refresh and POST /api/users/refresh-token. */
export interface RefreshTokenRequest {
  refreshToken: string | null;
  deviceInfo?: string | null;
}

export interface LogoutRequest {
  refreshToken: string | null;
}

export interface UserInfo {
  userId: number;
  username: string | null;
  email: string | null;
  displayName: string | null;
  role: string | null;
  level: string | null;
  lastLoginAt?: string | null;
  profileImageUrl?: string | null;
}

export interface User {
  id: number;
  username: string | null;
  email: string | null;
  passwordHash?: string | null; // Not displayed, but may be in response
  firstName?: string | null;
  lastName?: string | null;
  displayName: string | null;
  phone?: string | null; // API uses 'phone', not 'phoneNumber'
  phoneNumber?: string | null; // For backward compatibility
  dateOfBirth?: string | null;
  role: string | null;
  level: string | null;
  currentRankId?: number | null;
  senseiDiplomaId?: number | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  joinDate?: string | null;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface UpdateUserRequest {
  email?: string | null;
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null; // Format: YYYY-MM-DD
  isActive?: boolean;
  currentRankId?: number | null;
  userType?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  public refreshToken$ = this.refreshTokenSubject.asObservable();

  private userInfoSubject = new BehaviorSubject<UserInfo | null>(null);
  public userInfo$ = this.userInfoSubject.asObservable();

  private usersRefreshSubject = new Subject<void>();
  public usersRefresh$ = this.usersRefreshSubject.asObservable();

  /** Emits when access token is about to expire (proactive session-expiry). */
  private sessionExpiringSubject = new Subject<void>();
  public sessionExpiring$ = this.sessionExpiringSubject.asObservable();

  private expiryTimerId: ReturnType<typeof setTimeout> | null = null;
  private refreshExpiryTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() private router: Router | null = null,
    @Optional() private authDialogService: AuthDialogService | null = null,
    @Optional() private loginModalService: LoginModalService | null = null
  ) {
    // Log environment info for debugging (only in production to help diagnose issues)
    if (environment.production) {
      console.log('Production mode detected');
      console.log('Environment API URL:', environment.apiUrl);
      console.log('Service API URL:', this.apiUrl);
      console.log('Environment production flag:', environment.production);
    }
    
    // Validate API URL configuration
    if (!this.apiUrl) {
      console.error('API URL is not configured in environment!');
      throw new Error('API URL is not configured. Please check environment configuration.');
    }
    if (this.apiUrl.includes('localhost') && environment.production) {
      console.error('ERROR: Using localhost API URL in production mode!');
      console.error('Current API URL:', this.apiUrl);
      console.error('Environment object:', environment);
      throw new Error('Production build is using localhost API URL. Check environment configuration.');
    }
    
    // Check for stored token and user info on initialization (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      const token = this.getStoredToken();
      if (token) {
        this.tokenSubject.next(token);
      }
      const refreshToken = this.getStoredRefreshToken();
      if (refreshToken) {
        this.refreshTokenSubject.next(refreshToken);
      }
      const userInfo = this.getStoredUserInfo();
      if (userInfo) {
        this.userInfoSubject.next(userInfo);
        // Fetch full user details so profileImageUrl is available in the menu (e.g. after refresh)
        this.getUserDetails(userInfo.userId).subscribe();
      }
      const expiresAt = this.getStoredAccessTokenExpiresAt();
      if (expiresAt && this.getStoredToken()) {
        this.scheduleSessionExpiryTimer();
      }
      const refreshExpiresAt = this.getStoredRefreshTokenExpiresAt();
      if (refreshExpiresAt && this.getStoredRefreshToken()) {
        this.scheduleRefreshTokenExpiryTimer();
      }
      this.sessionExpiring$.subscribe(() => this.onSessionExpiring());
    }
  }

  /**
   * Login user with username/email (identifier) and password
   * @param identifier User's username or email
   * @param password User's password
   * @param deviceInfo Optional device information
   * @returns Observable with token response containing access and refresh tokens
   */
  login(identifier: string, password: string, deviceInfo?: string): Observable<TokenResponse> {
    const loginRequest: LoginRequest = { 
      identifier, 
      password,
      deviceInfo: deviceInfo || null
    };

    // POST /api/users/login → TokenResponse (accessTokenExpiresAt, refreshTokenExpiresAt used for expiry timers)
    return this.http.post<TokenResponse>(`${this.apiUrl}/users/login`, loginRequest, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(response => {
        if (response.accessToken) {
          this.setToken(response.accessToken);
        }
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
        if (response.accessTokenExpiresAt) {
          this.setAccessTokenExpiresAt(response.accessTokenExpiresAt);
        }
        if (response.refreshTokenExpiresAt) {
          this.setRefreshTokenExpiresAt(response.refreshTokenExpiresAt);
        }
        // Store user info
        const userInfo: UserInfo = {
          userId: response.userId,
          username: response.username,
          email: response.email,
          displayName: response.displayName,
          role: response.role,
          level: response.level,
          lastLoginAt: response.lastLoginAt || null
        };
        this.setUserInfo(userInfo);
        // Fetch full user details so profileImageUrl is available in the menu without visiting profile page
        this.getUserDetails(response.userId).subscribe();
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Register a new user
   */
  register(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/register`, request, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user and clear token
   */
  logout(): Observable<void> {
    const refreshToken = this.getRefreshToken();
    
    // If no refresh token, just clear local data and navigate
    if (!refreshToken) {
      this.clearToken();
      this.clearUserInfo();
      if (isPlatformBrowser(this.platformId) && this.router) {
        this.router.navigate(['/home']);
      }
      return of(void 0);
    }

    const logoutRequest: LogoutRequest = {
      refreshToken: refreshToken
    };

    // Call logout API
    return this.http.post<void>(`${this.apiUrl}/users/logout`, logoutRequest, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        // Clear tokens and user info regardless of API response
        this.clearToken();
        this.clearUserInfo();
        if (isPlatformBrowser(this.platformId) && this.router) {
          this.router.navigate(['/home']);
        }
      }),
      catchError(error => {
        // Even if API call fails, clear local data
        console.error('Logout error:', error);
        this.clearToken();
        this.clearUserInfo();
        if (isPlatformBrowser(this.platformId) && this.router) {
          this.router.navigate(['/home']);
        }
        // Return void instead of throwing error to prevent error propagation
        return of(void 0);
      })
    );
  }

  /**
   * Clear token and user info locally without calling logout API or navigating.
   * Use when session is expired (e.g. 401) and the user should re-login on the same page.
   */
  clearSessionLocally(): void {
    this.clearToken();
    this.clearUserInfo();
  }

  /**
   * Get current user info
   */
  getUserInfo(): UserInfo | null {
    return this.userInfoSubject.value;
  }

  notifyUsersRefresh(): void {
    this.usersRefreshSubject.next();
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshTokenSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if the access token is expired (or missing).
   * Uses JWT exp claim with 60s buffer to avoid edge cases.
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload?.exp;
      if (!exp || typeof exp !== 'number') return true;
      return Date.now() / 1000 >= exp - 60;
    } catch {
      return true;
    }
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  /**
   * Get stored refresh token from localStorage
   */
  private getStoredRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      return localStorage.getItem('refresh_token');
    } catch {
      return null;
    }
  }

  /**
   * Store token in localStorage and update subject
   */
  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('auth_token', token);
      } catch {
        // Ignore localStorage errors
      }
    }
    this.tokenSubject.next(token);
  }

  /**
   * Store refresh token in localStorage and update subject
   */
  private setRefreshToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('refresh_token', token);
      } catch {
        // Ignore localStorage errors
      }
    }
    this.refreshTokenSubject.next(token);
  }

  /**
   * Get stored user info from localStorage
   */
  private getStoredUserInfo(): UserInfo | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    try {
      const stored = localStorage.getItem('user_info');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Store user info in localStorage and update subject
   */
  private setUserInfo(userInfo: UserInfo): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('user_info', JSON.stringify(userInfo));
      } catch {
        // Ignore localStorage errors
      }
    }
    this.userInfoSubject.next(userInfo);
  }

  /**
   * Clear user info from localStorage and update subject
   */
  private clearUserInfo(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('user_info');
      } catch {
        // Ignore localStorage errors
      }
    }
    this.userInfoSubject.next(null);
  }

  /**
   * Clear token from localStorage and update subject
   */
  private clearToken(): void {
    this.clearExpiryTimer();
    this.clearRefreshExpiryTimer();
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT);
        localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN_EXPIRES_AT);
      } catch {
        // Ignore localStorage errors
      }
    }
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
  }

  private getStoredAccessTokenExpiresAt(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT);
    } catch {
      return null;
    }
  }

  /**
   * Normalize API expiry ISO string so Date() parses correctly.
   * Server may send 7 fractional seconds (e.g. 2026-02-23T07:51:23.2284645+00:00); JS expects at most 3 (ms).
   */
  private normalizeExpiryIso(isoString: string): string {
    if (!isoString || typeof isoString !== 'string') return isoString;
    return isoString.replace(/\.(\d{3})\d*/, '.$1');
  }

  private setAccessTokenExpiresAt(isoString: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const normalized = this.normalizeExpiryIso(isoString);
      localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN_EXPIRES_AT, normalized);
    } catch {
      // Ignore
    }
    this.scheduleSessionExpiryTimer();
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimerId != null) {
      clearTimeout(this.expiryTimerId);
      this.expiryTimerId = null;
    }
  }

  private getStoredRefreshTokenExpiresAt(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN_EXPIRES_AT);
    } catch {
      return null;
    }
  }

  private setRefreshTokenExpiresAt(isoString: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const normalized = this.normalizeExpiryIso(isoString);
      localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN_EXPIRES_AT, normalized);
    } catch {
      // Ignore
    }
    this.scheduleRefreshTokenExpiryTimer();
  }

  private clearRefreshExpiryTimer(): void {
    if (this.refreshExpiryTimerId != null) {
      clearTimeout(this.refreshExpiryTimerId);
      this.refreshExpiryTimerId = null;
    }
  }

  /**
   * Schedule a timer to auto-logout when refresh token expires (Option C: no dialog).
   */
  private scheduleRefreshTokenExpiryTimer(): void {
    this.clearRefreshExpiryTimer();
    const expiresAt = this.getStoredRefreshTokenExpiresAt();
    if (!expiresAt || !isPlatformBrowser(this.platformId)) return;
    const expiresMs = new Date(this.normalizeExpiryIso(expiresAt)).getTime();
    if (Number.isNaN(expiresMs)) return;
    const nowMs = Date.now();
    const delayMs = Math.max(0, expiresMs - nowMs);
    this.refreshExpiryTimerId = setTimeout(() => {
      this.refreshExpiryTimerId = null;
      this.logoutSilently();
    }, delayMs);
  }

  /**
   * Clear session and redirect to home without showing any dialog (used when refresh token expires).
   */
  private logoutSilently(): void {
    this.clearToken();
    this.clearUserInfo();
    if (isPlatformBrowser(this.platformId) && this.router) {
      this.router.navigate(['/home']);
    }
  }

  /**
   * Schedule a single timer to emit sessionExpiring$ shortly before access token expiry.
   * Call after login/refresh; cleared on logout.
   */
  private scheduleSessionExpiryTimer(): void {
    this.clearExpiryTimer();
    const expiresAt = this.getStoredAccessTokenExpiresAt();
    if (!expiresAt || !isPlatformBrowser(this.platformId)) return;
    const expiresMs = new Date(this.normalizeExpiryIso(expiresAt)).getTime();
    if (Number.isNaN(expiresMs)) return;
    const nowMs = Date.now();
    const warnAt = expiresMs - SESSION_EXPIRY_WARN_BEFORE_MS;
    const delayMs = Math.max(0, warnAt - nowMs);
    this.expiryTimerId = setTimeout(() => {
      this.expiryTimerId = null;
      this.sessionExpiringSubject.next();
    }, delayMs);
  }

  /**
   * Called when session is about to expire (timer or 401). Opens auth dialog and handles choice.
   */
  private onSessionExpiring(): void {
    if (!this.authDialogService || this.authDialogService.isOpen) return;
    this.authDialogService.open().pipe(take(1)).subscribe(choice => {
      if (choice === 'refresh') {
        const hasRefresh = !!this.getRefreshToken();
        if (!hasRefresh) {
          this.clearSessionLocally();
          this.router?.navigate(['/home']);
          this.loginModalService?.open('login');
          return;
        }
        this.refreshToken().subscribe({
          next: () => { /* new timer scheduled in refreshToken tap */ },
          error: () => {
            this.clearSessionLocally();
            this.router?.navigate(['/home']);
            this.loginModalService?.open('login');
          }
        });
      } else if (choice === 'logout') {
        this.logout().subscribe();
      }
    });
  }

  /**
   * Get user details by ID
   * @param userId User ID
   * @returns Observable with user details
   */
  getUserDetails(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((user: User) => {
        const current = this.getUserInfo();
        if (current && current.userId === userId) {
          this.setUserInfo({ ...current, profileImageUrl: user.profileImageUrl ?? null });
        }
      }),
      catchError((error: any) => {
        // status 200 but ok: false = server returned 200 but body was not valid JSON (e.g. HTML after backend restart)
        if (error?.status === 200 && error?.ok === false) {
          console.error('Get user details: server returned 200 but response was not valid JSON. Backend may have returned HTML or wrong Content-Type.', error);
          return throwError(() => ({
            ...error,
            error: { message: 'השרת החזיר תשובה לא תקינה. אם הרגע הפעלת מחדש את השרת, נסה לרענן את הדף.' }
          }));
        }
        console.error('Get user details error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all users (admin only)
   * @returns Observable with users list
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error: any) => {
        console.error('Get users error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user details
   * @param userId User ID
   * @param updateRequest User update data
   * @returns Observable with updated user details
   */
  updateUser(userId: number, updateRequest: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}`, updateRequest, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((updatedUser: User) => {
        // Update stored user info if this is the current user
        const currentUserInfo = this.getUserInfo();
        if (currentUserInfo && currentUserInfo.userId === userId) {
          const updatedUserInfo: UserInfo = {
            userId: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            displayName: updatedUser.displayName,
            role: updatedUser.role,
            level: updatedUser.level,
            lastLoginAt: updatedUser.lastLoginAt || null,
            profileImageUrl: updatedUser.profileImageUrl ?? currentUserInfo.profileImageUrl ?? null
          };
          this.setUserInfo(updatedUserInfo);
        }
      }),
      catchError((error: any) => {
        console.error('Update user error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a user
   * @param userId User ID to delete
   * @returns Observable that completes when delete succeeds
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        const currentUserInfo = this.getUserInfo();
        if (currentUserInfo && currentUserInfo.userId === userId) {
          this.logout().subscribe();
        } else {
          this.usersRefreshSubject.next();
        }
      }),
      catchError((error: any) => {
        console.error('Delete user error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Refresh access token using refresh token
   */
  refreshToken(): Observable<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const body: RefreshTokenRequest = { refreshToken, deviceInfo: null };
    return this.http.post<TokenResponse>(`${this.apiUrl}/users/refresh-token`, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(response => {
        if (response.accessToken) {
          this.setToken(response.accessToken);
        }
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
        if (response.accessTokenExpiresAt) {
          this.setAccessTokenExpiresAt(response.accessTokenExpiresAt);
        }
        if (response.refreshTokenExpiresAt) {
          this.setRefreshTokenExpiresAt(response.refreshTokenExpiresAt);
        }
        // Update user info if provided (preserve profileImageUrl; refresh endpoint may not return it)
        if (response.userId) {
          const current = this.getUserInfo();
          const userInfo: UserInfo = {
            userId: response.userId,
            username: response.username,
            email: response.email,
            displayName: response.displayName,
            role: response.role,
            level: response.level,
            lastLoginAt: response.lastLoginAt || null,
            profileImageUrl: (response as TokenResponse & { profileImageUrl?: string | null }).profileImageUrl ?? current?.profileImageUrl ?? null
          };
          this.setUserInfo(userInfo);
        }
      }),
      catchError(error => {
        console.error('Refresh token error:', error);
        // If refresh fails, clear tokens
        this.clearToken();
        this.clearUserInfo();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get HTTP headers with Bearer token for authenticated requests
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }
}
