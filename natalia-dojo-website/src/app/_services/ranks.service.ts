import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  getRanks(rankType?: string): Observable<Rank[]> {
    const query = rankType ? `?rankType=${encodeURIComponent(rankType)}` : '';
    const headers = this.getAuthHeaders();
    return this.http.get<Rank[]>(`${this.apiUrl}/ranks${query}`, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }
}
