import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface RegistrationDialogState {
  isOpen: boolean;
  event: Event | null;
}

export type EventStatus = 'draft' | 'published' | 'closed';
export type EventType = 'seminar' | 'workshop' | 'grading' | 'social' | 'special_training' | 'online_session';
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
  specialization: string | null;
  hourlyRate: number | null;
  isAvailable: boolean;
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
  status: string | null;
  paymentStatus: string | null;
  attended: boolean;
  checkedInAt: string | null;
  registeredAt: string;
  notes: string | null;
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
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

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

  registerForEvent(eventId: number, request: CreateEventRegistrationRequest): Observable<EventRegistrationResponse> {
    return this.http.post<EventRegistrationResponse>(`${this.apiUrl}/events/${eventId}/registrations`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        // Don't log 503 errors - they're backend database issues, not frontend problems
        if (error.status !== 503) {
          console.error('Event registration error:', error);
        }
        return throwError(() => error);
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }
}
