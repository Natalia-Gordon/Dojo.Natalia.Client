import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Event {
  id: number;
  title: string | null;
  description: string | null;
  eventType: string | null;
  instructorId: number | null;
  status: 'draft' | 'published' | 'closed' | string | null;
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
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: number;
  status: string | null;
  paymentStatus: string | null;
  attended: boolean;
  checkedInAt: string | null;
  notes: string | null;
  registeredAt: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

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
        console.error('Get events error:', error);
        // For 401 errors on public events, return empty array instead of throwing
        // This prevents the interceptor from redirecting to login
        if (error.status === 401 && !needsAuth) {
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
        console.error('Get event by id error:', error);
        return throwError(() => error);
      })
    );
  }

  registerForEvent(eventId: number, request: CreateEventRegistrationRequest): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(`${this.apiUrl}/events/${eventId}/registrations`, request, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('Event registration error:', error);
        return throwError(() => error);
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }
}
