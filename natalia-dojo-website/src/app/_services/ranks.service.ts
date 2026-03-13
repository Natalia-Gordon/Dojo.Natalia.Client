import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface Rank {
  id: number;
  name: string;
  slug: string;
  rank_type: string;
  belt_color: string | null;
  dan_level: number | null;
  display_order: number | null;
  description: string | null;
  minimum_age: number | null;
  minimum_training_months: number | null;
  is_teacher_eligible: boolean;
  can_test_for_sensei: boolean;
  created_at: string | null;
  updated_at: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class RanksService {
  private apiUrl = environment.apiUrl;
  /** Cache per rankType so multiple components share one HTTP request per page load. */
  private cache = new Map<string, Observable<Rank[]>>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getRanks(rankType?: string): Observable<Rank[]> {
    const key = rankType ?? '';
    let obs = this.cache.get(key);
    if (!obs) {
      const query = rankType ? `?rankType=${encodeURIComponent(rankType)}` : '';
      const headers = this.getAuthHeaders();
      obs = this.http.get<Rank[]>(`${this.apiUrl}/ranks${query}`, { headers }).pipe(
        shareReplay(1),
        catchError(() => of([]))
      );
      this.cache.set(key, obs);
    }
    return obs;
  }

  /** Clear cache (e.g. on logout) so next request after login is fresh. */
  clearCache(): void {
    this.cache.clear();
  }

  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }
}
