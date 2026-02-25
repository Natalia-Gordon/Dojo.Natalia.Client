import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs';
import { forkJoin } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface RegistrationDialogState {
  isOpen: boolean;
  event: Event | null;
}

export type EventStatus = 'draft' | 'published' | 'closed';
export type EventType = 'seminar' | 'workshop' | 'grading' | 'social' | 'special_training' | 'online_session' | 'retreat' | 'zen_session';
export type PaymentStatus = 'free' | 'pending' | 'paid' | 'refunded' | 'cancelled';
export type PaymentMethod = 'bit' | 'credit_card' | 'cash' | 'bank_transfer' | 'google_pay' | 'apple_pay' | 'paypal';

export interface Event {
  id: number;
  title: string | null;
  description: string | null;
  eventType: EventType | string | null;
  instructorId: number | null;
  status: EventStatus | string | null;
  startDateTime: string;
  endDateTime: string;
  location: string | null;
  locationUrl: string | null;
  maxAttendees: number | null;
  price: number;
  earlyBirdPrice: number | null;
  earlyBirdDeadline: string | null;
  registrationOpen: boolean;
  registrationDeadline: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  instructorId: number;
  userId: number;
  username: string | null;
  displayName: string | null;
  email: string | null;
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
  /** @deprecated Prefer bankNumber + branchName */
  bankId: string | null;
  bankNumber: string | null;
  branchName: string | null;
  branchNumber: string | null;
  /** Source of truth for instructor payment methods (Bit + bank transfer). */
  paymentMethods?: InstructorPaymentMethodDto[];
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

export interface CreateEventRequest {
  title?: string | null;
  description?: string | null;
  eventType?: string | null;
  instructorId?: number | null;
  status?: string | null;
  startDateTime: string;
  endDateTime: string;
  location?: string | null;
  locationUrl?: string | null;
  maxAttendees?: number | null;
  price: number;
  earlyBirdPrice?: number | null;
  earlyBirdDeadline?: string | null;
  registrationOpen: boolean;
  registrationDeadline?: string | null;
  imageUrl?: string | null;
  isPublished: boolean;
}

export interface CreateEventRegistrationRequest {
  userId: number;
  notes?: string | null;
  paymentMethod?: PaymentMethod | string | null;
}

/** PATCH /api/events/{eventId}/registrations/{registrationId}/attendance */
export interface UpdateEventAttendanceRequest {
  attended?: boolean;
  checkedInAt?: string | null;
}

/**
 * POST /api/events/{eventId}/registrations/{registrationId}/resend-email
 * Type: "confirmation" (to registrant), "payment_approval" (to event creator), or "both" (default when omitted).
 */
export interface ResendRegistrationEmailRequest {
  type?: string | null;
}

/** POST approve-payment body. approved: true = set to paid, false = reject (failed). */
export interface ApprovePaymentRequest {
  approved: boolean;
  approvalNotes?: string | null;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  status: string | null;
  paymentStatus: PaymentStatus | string | null;
  attended: boolean;
  checkedInAt: string | null;
  notes: string | null;
  registeredAt: string;
  approvedBy: number | null;
  approvedAt: string | null;
  approvalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistrationDetailsResponse {
  registrationId: number;
  eventId: number;
  userId: number;
  username: string | null;
  email: string | null;
  /** User first name (from user profile). */
  firstName?: string | null;
  /** User last name (from user profile). */
  lastName?: string | null;
  /** User phone (from user profile). */
  phone?: string | null;
  status: string | null;
  paymentStatus: string | null;
  attended: boolean;
  checkedInAt: string | null;
  registeredAt: string;
  notes: string | null;
  /** When the confirmation email was last sent to the registrant (null = not sent). */
  confirmationEmailSentAt?: string | null;
  /** When the payment approval email was last sent to the event creator (null = not sent). */
  paymentApprovalEmailSentAt?: string | null;
}

/** Optional query filters for GET /api/events/{id}/registrations (case-insensitive substring where applicable). */
export interface EventRegistrationsFilters {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export interface EventRegistrationHistoryResponse {
  registrationId: number;
  eventId: number;
  eventTitle: string | null;
  eventType: string | null;
  startDateTime: string;
  endDateTime: string;
  status: string | null;
  paymentStatus: string | null;
  attended: boolean;
  registeredAt: string;
  /** When the confirmation email was last sent (null = not sent). */
  confirmationEmailSentAt?: string | null;
  /** When the payment approval email was last sent (null = not sent). */
  paymentApprovalEmailSentAt?: string | null;
}

/** Admin events list: GET /api/events/admin (sorting, filtering, paging). registeredCountByEventId has string keys (e.g. "1", "2"). */
export interface PagedEventsResponse {
  items: Event[] | null;
  totalCount: number;
  page: number;
  pageSize: number;
  registeredCountByEventId?: Record<string, number>;
}

/** One registration with its event (for admin pending-payments list). */
export interface PendingPaymentItem {
  event: Event;
  registration: EventRegistrationDetailsResponse;
}

export interface EventRegistrationResponse {
  registrationNumber: number;
  eventId: number;
  eventTitle: string | null;
  status: string | null;
  paymentStatus: string | null;
  paymentMethod: string | null;
  registeredAt: string;
  message: string | null;
  emailSentToUser: boolean;
  emailSentToEventCreator: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Registration Dialog State Management
  private registrationDialogStateSubject = new BehaviorSubject<RegistrationDialogState>({
    isOpen: false,
    event: null
  });
  public registrationDialogState$ = this.registrationDialogStateSubject.asObservable();

  openRegistrationDialog(event: Event): void {
    this.registrationDialogStateSubject.next({
      isOpen: true,
      event: event
    });
  }

  closeRegistrationDialog(): void {
    this.registrationDialogStateSubject.next({
      isOpen: false,
      event: null
    });
  }

  getEvents(params?: {
    type?: string;
    includeUnpublished?: boolean;
    status?: string;
    userId?: number;
  }): Observable<Event[]> {
    let httpParams = new HttpParams();
    if (params?.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (typeof params?.includeUnpublished === 'boolean') {
      httpParams = httpParams.set('includeUnpublished', String(params.includeUnpublished));
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (typeof params?.userId === 'number') {
      httpParams = httpParams.set('userId', params.userId.toString());
    }

    // For public events (when includeUnpublished is false), don't send auth headers
    // Only send auth headers if explicitly requesting unpublished events (admin/instructor)
    const needsAuth = params?.includeUnpublished === true;
    const headers = needsAuth ? this.getAuthHeaders() : new HttpHeaders();

    return this.http.get(`${this.apiUrl}/events`, {
      headers: headers,
      params: httpParams,
      responseType: 'text'
    }).pipe(
      map((responseText) => {
        if (!responseText) {
          return [];
        }
        try {
          const parsed = JSON.parse(responseText) as Event[];
          return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
          console.error('Invalid events response format:', error);
          return [];
        }
      }),
      catchError(error => {
        // Handle 503 Service Unavailable (database connection issues) - return empty array silently
        if (error.status === 503) {
          // Don't log 503 errors - they're backend database issues, not frontend problems
          return of([]);
        }
        // Only log non-network errors to reduce console noise
        if (error.status !== 0 && error.status !== 503) {
          console.error('Get events error:', error);
        }
        // For 401 errors on public events, return empty array instead of throwing
        // This prevents the interceptor from redirecting to login
        if (error.status === 401 && !needsAuth) {
          return of([]);
        }
        // For network errors (status 0), return empty array to prevent UI crashes
        if (error.status === 0) {
          return of([]);
        }
        return throwError(() => error);
      })
    );
  }

  createEvent(request: CreateEventRequest): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Create event error:', error);
        return throwError(() => error);
      })
    );
  }

  getEventById(eventId: number, requireAuth: boolean = false): Observable<Event> {
    // Public endpoint - no auth required by default
    // But if requireAuth is true (admin/instructor), send auth headers to see unpublished events or more details
    const headers = requireAuth ? this.getAuthHeaders() : new HttpHeaders();
    
    return this.http.get<Event>(`${this.apiUrl}/events/${eventId}`, {
      headers: headers,
      responseType: 'json'
    }).pipe(
      catchError(error => {
        // Handle 503 Service Unavailable (database connection issues) - don't log
        if (error.status === 503) {
          // Don't log 503 errors - they're backend database issues, not frontend problems
          return throwError(() => error);
        }
        // Only log non-network errors (status 0) to reduce console noise
        if (error.status !== 0 && error.status !== 503) {
          console.error('Get event by id error:', error);
        }
        return throwError(() => error);
      })
    );
  }

  getInstructors(includeUnavailable: boolean = false): Observable<Instructor[]> {
    const params = new HttpParams().set('includeUnavailable', includeUnavailable.toString());
    
    return this.http.get<Instructor[]>(`${this.apiUrl}/instructors`, {
      headers: this.getAuthHeaders(),
      params: params
    }).pipe(
      catchError(error => {
        // Handle 503 Service Unavailable (database connection issues) - return empty array silently
        if (error.status === 503) {
          // Don't log 503 errors - they're backend database issues, not frontend problems
          return of([]);
        }
        // Only log non-network errors to reduce console noise
        if (error.status !== 0 && error.status !== 503) {
          console.error('Get instructors error:', error);
        }
        
        // For network errors (status 0), return empty array to prevent UI crashes
        if (error.status === 0) {
          return of([]);
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Get a specific instructor by ID
   */
  getInstructorById(instructorId: number): Observable<Instructor> {
    return this.http.get<Instructor>(`${this.apiUrl}/instructors/${instructorId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        // Handle 503 Service Unavailable (database connection issues)
        if (error.status === 503) {
          return throwError(() => new Error('Service temporarily unavailable'));
        }
        // Only log non-network errors to reduce console noise
        if (error.status !== 0 && error.status !== 503) {
          console.error('Get instructor by ID error:', error);
        }
        return throwError(() => error);
      })
    );
  }

  registerForEvent(eventId: number, request: CreateEventRegistrationRequest, paymentProofFile?: File | null): Observable<EventRegistrationResponse> {
    // If there's a file, use FormData; otherwise use JSON
    if (paymentProofFile) {
      const formData = new FormData();
      // Append all fields as strings (backend expects string values)
      formData.append('userId', request.userId.toString());
      if (request.notes) {
        formData.append('notes', request.notes);
      }
      if (request.paymentMethod) {
        formData.append('paymentMethod', request.paymentMethod);
      }
      // Append file - backend may expect different field name
      // Common field names: 'file', 'paymentProof', 'paymentProofFile', 'fileUpload'
      // Check backend API documentation for the correct field name
      formData.append('file', paymentProofFile, paymentProofFile.name);
      
      // For FormData, we need to let the browser set Content-Type with boundary
      // Create headers without Content-Type so browser can set multipart/form-data with boundary
      const token = this.authService.getToken();
      // Create headers manually to avoid any Content-Type being set
      // Angular HttpClient will automatically set Content-Type: multipart/form-data with boundary for FormData
      const formDataHeaders = new HttpHeaders();
      const headersWithAuth = token 
        ? formDataHeaders.set('Authorization', `Bearer ${token}`)
        : formDataHeaders;
      
      return this.http.post<EventRegistrationResponse>(`${this.apiUrl}/events/${eventId}/registrations`, formData, {
        headers: headersWithAuth
        // Note: Do NOT set Content-Type header - Angular HttpClient will automatically set
        // Content-Type: multipart/form-data; boundary=... when sending FormData
      }).pipe(
        catchError(error => {
          if (error.status === 404) {
            console.error(`Event registration endpoint not found (404): ${this.apiUrl}/events/${eventId}/registrations`);
            console.error('Check if the backend API endpoint is correctly configured.');
          } else if (error.status === 415) {
            console.error('Unsupported Media Type (415): The server may not accept multipart/form-data. Check backend configuration.');
          }
          // Don't log 503 errors - they're backend database issues, not frontend problems
          if (error.status !== 503 && error.status !== 415 && error.status !== 404) {
            console.error('Event registration error:', error);
          }
          return throwError(() => error);
        })
      );
    } else {
      // No file - use JSON as before
      return this.http.post<EventRegistrationResponse>(`${this.apiUrl}/events/${eventId}/registrations`, request, {
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(error => {
          if (error.status === 404) {
            console.error(`Event registration endpoint not found (404): ${this.apiUrl}/events/${eventId}/registrations`);
            console.error('Check if the backend API endpoint is correctly configured.');
          }
          // Don't log 503 errors - they're backend database issues, not frontend problems
          if (error.status !== 503 && error.status !== 404) {
            console.error('Event registration error:', error);
          }
          return throwError(() => error);
        })
      );
    }
  }

  /**
   * Admin-only: list all events with server-side sorting, filtering, and paging.
   * GET /api/events/admin — sortBy: id | title | type | status | startDate | price
   */
  getAdminEvents(params: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    type?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Observable<PagedEventsResponse> {
    let httpParams = new HttpParams();
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder) httpParams = httpParams.set('sortOrder', params.sortOrder);
    if (params.search?.trim()) httpParams = httpParams.set('search', params.search.trim());
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.page != null) httpParams = httpParams.set('page', params.page.toString());
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize.toString());

    return this.http
      .get<PagedEventsResponse>(`${this.apiUrl}/events/admin`, {
        headers: this.getAuthHeaders(),
        params: httpParams
      })
      .pipe(
        map((res) => ({
          items: res?.items ?? [],
          totalCount: res?.totalCount ?? 0,
          page: res?.page ?? 1,
          pageSize: res?.pageSize ?? 10,
          registeredCountByEventId: res?.registeredCountByEventId ?? {}
        })),
        catchError((error) => {
          if (error.status === 503) {
            return of({ items: [], totalCount: 0, page: 1, pageSize: 10, registeredCountByEventId: {} });
          }
          if (error.status !== 0 && error.status !== 503) {
            console.error('Get admin events error:', error);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Admin/instructor: list registrations for an event.
   * GET /api/events/{eventId}/registrations
   * Optional query filters: firstName, lastName, phone (substring, case-insensitive for names).
   */
  getEventRegistrations(eventId: number, filters?: EventRegistrationsFilters | null): Observable<EventRegistrationDetailsResponse[]> {
    let params = new HttpParams();
    if (filters) {
      const f = filters;
      if (f.firstName != null && String(f.firstName).trim() !== '') params = params.set('firstName', String(f.firstName).trim());
      if (f.lastName != null && String(f.lastName).trim() !== '') params = params.set('lastName', String(f.lastName).trim());
      if (f.phone != null && String(f.phone).trim() !== '') params = params.set('phone', String(f.phone).trim());
    }
    return this.http
      .get<EventRegistrationDetailsResponse[]>(`${this.apiUrl}/events/${eventId}/registrations`, {
        headers: this.getAuthHeaders(),
        params
      })
      .pipe(
        map((data) => (Array.isArray(data) ? data : [])),
        catchError((error) => {
          if (error.status === 503) return of([]);
          if (error.status === 404) return of([]);
          if (error.status !== 0 && error.status !== 503) {
            console.error('Get event registrations error:', error);
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Admin/instructor: export event registrations as CSV.
   * GET /api/events/{id}/registrations/csv
   * Returns blob (text/csv or application/octet-stream).
   */
  getEventRegistrationsCsv(eventId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/events/${eventId}/registrations/csv`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob',
    }).pipe(
      catchError((error) => {
        if (error.status !== 0 && error.status !== 503) {
          console.error('Get event registrations CSV error:', error);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Admin/instructor: list registrations with payment status pending for a single event.
   * GET /api/events/{id}/registrations then filter to pending.
   */
  getPendingPaymentRegistrationsForEvent(eventId: number): Observable<PendingPaymentItem[]> {
    return this.getEventById(eventId, true).pipe(
      switchMap((event) =>
        this.getEventRegistrations(eventId).pipe(
          map((regs) =>
            regs
              .filter((r) => (r.paymentStatus ?? '').toLowerCase() === 'pending')
              .map((registration) => ({ event, registration }))
          )
        )
      ),
      catchError(() => of([]))
    );
  }

  /**
   * Admin: list all registrations with payment status pending (across events).
   * Uses getAdminEvents then getEventRegistrations per event and flattens. Optional backend: GET /api/admin/registrations?paymentStatus=pending
   */
  getPendingPaymentRegistrations(): Observable<PendingPaymentItem[]> {
    const pageSize = 100;
    return this.getAdminEvents({
      sortBy: 'startDate',
      sortOrder: 'desc',
      status: '', // all statuses to include published/closed events with pending payments
      page: 1,
      pageSize
    }).pipe(
      switchMap((paged) => {
        const items = paged.items ?? [];
        if (items.length === 0) return of([]);
        return forkJoin(
          items.map((ev) =>
            this.getEventRegistrations(ev.id).pipe(
              map((regs) =>
                regs
                  .filter((r) => (r.paymentStatus ?? '').toLowerCase() === 'pending')
                  .map((registration) => ({ event: ev, registration }))
              )
            )
          )
        ).pipe(
          map((arrays) => arrays.flat())
        );
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Admin/instructor: approve or reject a pending payment.
   * POST /api/events/{eventId}/registrations/{registrationId}/approve-payment
   * Body: { approved: true | false, approvalNotes?: string }
   * Only registrations with pending payment can be approved/rejected; otherwise 400.
   * Returns the updated EventRegistration (200).
   */
  approvePaymentRegistration(
    eventId: number,
    registrationId: number,
    request: ApprovePaymentRequest
  ): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(
      `${this.apiUrl}/events/${eventId}/registrations/${registrationId}/approve-payment`,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError((error) => {
        if (error.status !== 0 && error.status !== 503) {
          console.error('Approve payment error:', error);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Admin/instructor: resend registration emails (confirmation to registrant and/or payment approval to event creator).
   * POST /api/events/{eventId}/registrations/{registrationId}/resend-email
   * Use when initial background sending failed. Omit type or pass "both" for both emails.
   */
  resendRegistrationEmail(
    eventId: number,
    registrationId: number,
    type: 'confirmation' | 'payment_approval' | 'both'
  ): Observable<unknown> {
    const body: ResendRegistrationEmailRequest = { type };
    return this.http.post(
      `${this.apiUrl}/events/${eventId}/registrations/${registrationId}/resend-email`,
      body,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError((error) => {
        if (error.status !== 0 && error.status !== 503) {
          console.error('Resend registration email error:', error);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Admin/instructor: update attendance for a registration.
   * PATCH /api/events/{eventId}/registrations/{registrationId}/attendance
   */
  updateRegistrationAttendance(
    eventId: number,
    registrationId: number,
    request: UpdateEventAttendanceRequest
  ): Observable<EventRegistration> {
    return this.http.patch<EventRegistration>(
      `${this.apiUrl}/events/${eventId}/registrations/${registrationId}/attendance`,
      request,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError((error) => {
        if (error.status !== 0 && error.status !== 503) {
          console.error('Update attendance error:', error);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user's event registrations (for "My Events" page).
   * GET /api/users/me/event-registrations
   */
  getMyEventRegistrations(): Observable<EventRegistrationHistoryResponse[]> {
    return this.http
      .get<EventRegistrationHistoryResponse[]>(`${this.apiUrl}/users/me/event-registrations`, {
        headers: this.getAuthHeaders()
      })
      .pipe(
        map((data) => (Array.isArray(data) ? data : [])),
        catchError((error) => {
          if (error.status === 503) return of([]);
          if (error.status === 404) return of([]);
          if (error.status !== 0 && error.status !== 503) console.error('Get my event registrations error:', error);
          return throwError(() => error);
        })
      );
  }

  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }
}
