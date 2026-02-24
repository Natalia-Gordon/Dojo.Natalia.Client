import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '../_services/auth.service';
import {
  EventsService,
  EventRegistrationHistoryResponse,
} from '../_services/events.service';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css',
})
export class MyEventsComponent implements OnInit, OnDestroy {
  registrations: EventRegistrationHistoryResponse[] = [];
  isLoading = false;
  errorMessage = '';
  isAuthenticated = false;
  userInfo: UserInfo | null = null;

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private eventsService: EventsService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.userInfo = this.authService.getUserInfo();
    this.isAuthenticated = !!this.authService.getToken();

    if (this.isAuthenticated) this.loadMyEvents();

    this.authSubscription = this.authService.token$.subscribe((token) => {
      this.isAuthenticated = !!token;
      if (!token) {
        this.registrations = [];
        this.userInfo = null;
      } else {
        this.userInfo = this.authService.getUserInfo();
        this.loadMyEvents();
      }
    });

    this.userSubscription = this.authService.userInfo$.subscribe((userInfo) => {
      this.userInfo = userInfo;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  loadMyEvents(): void {
    if (!isPlatformBrowser(this.platformId) || !this.isAuthenticated) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.eventsService.getMyEventRegistrations().subscribe({
      next: (list) => {
        this.registrations = list ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'יש להתחבר כדי לראות את האירועים שלך.';
          this.registrations = [];
        } else if (err.status === 404) {
          this.registrations = [];
        } else if (err.status === 0) {
          this.errorMessage = 'לא ניתן להתחבר לשרת. אנא נסה שוב.';
        } else {
          this.errorMessage = 'שגיאה בטעינת האירועים. נסו שוב מאוחר יותר.';
        }
      },
    });
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return '—';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${h}:${m}`;
    } catch {
      return '—';
    }
  }

  /** Display email sent timestamp or "לא נשלח" for my-events cards. */
  formatEmailSentAt(sentAt: string | null | undefined): string {
    if (!sentAt) return 'לא נשלח';
    return this.formatDate(sentAt);
  }

  getPaymentStatusLabel(status: string | null): string {
    if (!status) return '—';
    const s = (status + '').toLowerCase();
    const map: Record<string, string> = {
      free: 'חינם',
      pending: 'ממתין',
      paid: 'שולם',
      refunded: 'הוחזר',
      cancelled: 'בוטל',
    };
    return map[s] ?? status;
  }

  getEventTypeLabel(eventType: string | null): string {
    if (!eventType) return '—';
    const key = (eventType + '').toLowerCase().replace(/\s+/g, '_');
    const map: Record<string, string> = {
      seminar: 'סמינר',
      workshop: 'סדנה',
      grading: 'דרגות',
      social: 'חברתי',
      special_training: 'אימון מיוחד',
      online_session: 'מפגש אונליין',
      retreat: 'ריטריט',
      zen_session: 'מפגש זן',
    };
    return map[key] ?? eventType;
  }

  goToEvent(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }

  trackByRegistrationId(_index: number, r: EventRegistrationHistoryResponse): number {
    return r.registrationId;
  }
}
