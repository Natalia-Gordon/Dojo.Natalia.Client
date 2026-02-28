import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Instructor {
  instructorId: number;
  userId: number;
  username: string | null;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  rank: string | null;
  yearsOfExperience: number | null;
  specialization: string[] | null;
  hourlyRate: number | null;
  isAvailable: boolean;
  /** Top-level bank fields for backward compatibility; prefer paymentMethods when present. */
  bankName: string | null;
  accountHolderName: string | null;
  accountNumber: string | null;
  iban: string | null;
  swiftBic: string | null;
  bankAddress: string | null;
  bankNumber: string | null;
  branchName: string | null;
  branchNumber: string | null;
  /** Source of truth for instructor payment methods (Bit + bank transfer). */
  paymentMethods?: InstructorPaymentMethodDto[];
  /** Certificates stored in GCS; downloadUrl is GET /api/instructors/{id}/certificates/download?path=... */
  certificates?: InstructorCertificate[];
}

/** Certificate item returned by GET /api/instructors and GET /api/instructors/{id}. */
export interface InstructorCertificate {
  fileName: string;
  downloadUrl: string;
}

/** One payment method on InstructorResponse (bit or bank_transfer). */
export interface InstructorPaymentMethodDto {
  id: number;
  paymentType: 'bit' | 'bank_transfer';
  isDefault: boolean;
  phoneNumber?: string | null;
  bankName?: string | null;
  accountHolderName?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  swiftBic?: string | null;
  bankAddress?: string | null;
  bankNumber?: string | null;
  branchName?: string | null;
  branchNumber?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class InstructorsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getInstructors(includeUnavailable: boolean = false): Observable<Instructor[]> {
    const params = new HttpParams().set('includeUnavailable', includeUnavailable.toString());
    return this.http.get<Instructor[]>(`${this.apiUrl}/instructors`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(error => {
        if (error.status === 503) return of([]);
        if (error.status !== 0 && error.status !== 503) {
          console.error('Get instructors error:', error);
        }
        if (error.status === 0) return of([]);
        return throwError(() => error);
      })
    );
  }

  getInstructorById(instructorId: number): Observable<Instructor> {
    return this.http.get<Instructor>(`${this.apiUrl}/instructors/${instructorId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 503) {
          return throwError(() => new Error('Service temporarily unavailable'));
        }
        if (error.status !== 0 && error.status !== 503) {
          console.error('Get instructor by ID error:', error);
        }
        return throwError(() => error);
      })
    );
  }

  updateInstructorBankDetails(
    instructorId: number,
    bankDetails: {
      accountHolderName?: string | null;
      bankName?: string | null;
      bankNumber?: string | null;
      branchName?: string | null;
      branchNumber?: string | null;
      accountNumber?: string | null;
      bankAddress?: string | null;
    }
  ): Observable<Instructor> {
    return this.http.put<Instructor>(`${this.apiUrl}/instructors/${instructorId}`, bankDetails, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Update instructor bank details error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload certificate files for an instructor.
   * POST /api/instructors/{id}/certificates — body: multipart form with key "files".
   * Auth: admin or the instructor (same user as instructor.UserId).
   */
  uploadInstructorCertificates(instructorId: number, files: File[]): Observable<Instructor> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f, f.name));
    const token = this.authService.getToken();
    const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
    return this.http.post<Instructor>(`${this.apiUrl}/instructors/${instructorId}/certificates`, formData, {
      headers
    }).pipe(
      catchError(error => {
        console.error('Upload instructor certificates error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Download a certificate file with auth (Bearer token).
   * For use from פרטי משתמש (user details) / instructor profile; request is sent with Authorization header.
   */
  downloadInstructorCertificate(downloadUrl: string): Observable<Blob> {
    try {
      const url = new URL(downloadUrl);
      const pathAndQuery = url.pathname + url.search;
      const normalizedUrl = this.apiUrl.startsWith('http')
        ? new URL(this.apiUrl).origin + pathAndQuery
        : pathAndQuery;
      const token = this.authService.getToken();
      const headers = token
        ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
        : new HttpHeaders();
      return this.http.get(normalizedUrl, { responseType: 'blob', headers });
    } catch {
      const token = this.authService.getToken();
      const headers = token
        ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
        : new HttpHeaders();
      return this.http.get(downloadUrl, { responseType: 'blob', headers });
    }
  }

  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }
}
