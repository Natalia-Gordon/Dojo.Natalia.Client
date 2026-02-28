import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type NewsletterSubscribeResult =
  | { success: true; alreadySubscribed: boolean }
  | { success: false; error: string };

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * POST /api/newsletter/subscribe (public, no auth)
   * 201: new subscription created
   * 200: already subscribed (idempotent)
   * 400: email missing or invalid
   */
  subscribe(email: string): Observable<NewsletterSubscribeResult> {
    const normalized = email?.trim().toLowerCase() || '';
    if (!normalized) {
      return of({ success: false, error: 'נא להזין כתובת מייל' });
    }

    return this.http
      .post<unknown>(`${this.apiUrl}/newsletter/subscribe`, { email: normalized }, {
        observe: 'response',
        responseType: 'json'
      })
      .pipe(
        map((res): NewsletterSubscribeResult => {
          if (res.status === 201) {
            return { success: true, alreadySubscribed: false };
          }
          if (res.status === 200) {
            return { success: true, alreadySubscribed: true };
          }
          return { success: false, error: 'אירעה שגיאה. נסי שוב מאוחר יותר.' };
        }),
        catchError((err): Observable<NewsletterSubscribeResult> => {
          const msg: string =
            (typeof err?.error?.message === 'string' ? err.error.message : null) ||
            (err?.status === 400 ? 'כתובת המייל אינה תקינה' : 'אירעה שגיאה. נסי שוב מאוחר יותר.');
          return of({ success: false, error: msg });
        })
      );
  }
}
