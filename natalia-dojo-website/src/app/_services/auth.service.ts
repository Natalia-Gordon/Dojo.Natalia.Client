import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  identifier: string | null;
  password: string | null;
  deviceInfo?: string | null;
}

export interface TokenResponse {
  userId: number;
  username: string | null;
  email: string | null;
  displayName: string | null;
  role: string | null;
  level: string | null;
  accessToken: string | null;
  accessTokenExpiresAt: string;
  refreshToken: string | null;
  refreshTokenExpiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl || 'http://localhost:5000/api';
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  public token$ = this.tokenSubject.asObservable();
  
  private refreshTokenSubject = new BehaviorSubject<string | null>(this.getStoredRefreshToken());
  public refreshToken$ = this.refreshTokenSubject.asObservable();

  constructor() {
    // Check for stored token on initialization
    const token = this.getStoredToken();
    if (token) {
      this.tokenSubject.next(token);
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
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user and clear token
   */
  logout(): void {
    this.clearToken();
    this.router.navigate(['/home']);
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
