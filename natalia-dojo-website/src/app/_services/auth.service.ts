import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
}

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
  displayName?: string | null;
  phone?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null; // Format: YYYY-MM-DD
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public token$ = this.tokenSubject.asObservable();
  
  private refreshTokenSubject = new BehaviorSubject<string | null>(this.getStoredRefreshToken());
  public refreshToken$ = this.refreshTokenSubject.asObservable();

  private userInfoSubject = new BehaviorSubject<UserInfo | null>(this.getStoredUserInfo());
  public userInfo$ = this.userInfoSubject.asObservable();

  constructor() {
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
    
    // Check for stored token and user info on initialization
    const token = this.getStoredToken();
    if (token) {
      this.tokenSubject.next(token);
    }
    const userInfo = this.getStoredUserInfo();
    if (userInfo) {
      this.userInfoSubject.next(userInfo);
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

    // Use the actual API endpoint from Swagger
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
        this.router.navigate(['/home']);
      }),
      catchError(error => {
        // Even if API call fails, clear local data
        console.error('Logout error:', error);
        this.clearToken();
        this.clearUserInfo();
        this.router.navigate(['/home']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user info
   */
  getUserInfo(): UserInfo | null {
    return this.userInfoSubject.value;
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
   * Get current authentication token
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Get stored refresh token from localStorage
   */
  private getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  /**
   * Store token in localStorage and update subject
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('auth_token', token);
      this.tokenSubject.next(token);
    }
  }

  /**
   * Store refresh token in localStorage and update subject
   */
  private setRefreshToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('refresh_token', token);
      this.refreshTokenSubject.next(token);
    }
  }

  /**
   * Get stored user info from localStorage
   */
  private getStoredUserInfo(): UserInfo | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('user_info');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Store user info in localStorage and update subject
   */
  private setUserInfo(userInfo: UserInfo): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('user_info', JSON.stringify(userInfo));
      this.userInfoSubject.next(userInfo);
    }
  }

  /**
   * Clear user info from localStorage and update subject
   */
  private clearUserInfo(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user_info');
      this.userInfoSubject.next(null);
    }
  }

  /**
   * Clear token from localStorage and update subject
   */
  private clearToken(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      this.tokenSubject.next(null);
      this.refreshTokenSubject.next(null);
    }
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
      catchError((error: any) => {
        console.error('Get user details error:', error);
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
            lastLoginAt: updatedUser.lastLoginAt || null
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
