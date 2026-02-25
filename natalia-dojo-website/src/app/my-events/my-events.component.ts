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

type ViewMode = 'list' | 'calendar';

interface CalendarDay {
  key: string;
  date: Date;
  isOtherMonth: boolean;
  isToday: boolean;
  events: EventRegistrationHistoryResponse[];
}

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

  viewMode: ViewMode = 'list';
  calendarCurrentMonth = new Date();
  calendarDays: CalendarDay[] = [];
  calendarTitle = '';

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
        this.buildCalendar();
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
    this.router.navigate(['/events', eventId], { queryParams: { from: 'my-events' } });
  }

  trackByRegistrationId(_index: number, r: EventRegistrationHistoryResponse): number {
    return r.registrationId;
  }

  get upcomingCount(): number {
    const now = new Date();
    return this.registrations.filter((r) => new Date(r.startDateTime) > now).length;
  }

  buildCalendar(): void {
    const year = this.calendarCurrentMonth.getFullYear();
    const month = this.calendarCurrentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay();
    const daysInMonth = last.getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    this.calendarTitle = `${monthNames[month]} ${year}`;

    const days: CalendarDay[] = [];
    const startOffset = startDay === 0 ? 6 : startDay - 1;

    for (let i = 0; i < startOffset; i++) {
      const d = new Date(year, month, 1 - (startOffset - i));
      days.push({
        key: `pad-${i}`,
        date: d,
        isOtherMonth: true,
        isToday: false,
        events: this.getEventsForDate(d)
      });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      days.push({
        key: `d-${d}`,
        date,
        isOtherMonth: false,
        isToday: dateOnly.getTime() === today.getTime(),
        events: this.getEventsForDate(date)
      });
    }

    const remaining = 42 - days.length;
    for (let i = 0; i < remaining; i++) {
      const d = new Date(year, month + 1, i + 1);
      days.push({
        key: `pad2-${i}`,
        date: d,
        isOtherMonth: true,
        isToday: false,
        events: this.getEventsForDate(d)
      });
    }

    this.calendarDays = days;
  }

  private getEventsForDate(date: Date): EventRegistrationHistoryResponse[] {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.registrations.filter((r) => {
      const evStart = new Date(r.startDateTime);
      return evStart >= start && evStart <= end;
    });
  }

  calendarPrevMonth(): void {
    this.calendarCurrentMonth = new Date(this.calendarCurrentMonth.getFullYear(), this.calendarCurrentMonth.getMonth() - 1);
    this.buildCalendar();
  }

  calendarNextMonth(): void {
    this.calendarCurrentMonth = new Date(this.calendarCurrentMonth.getFullYear(), this.calendarCurrentMonth.getMonth() + 1);
    this.buildCalendar();
  }

  downloadUpcomingEvents(): void {
    const now = new Date();
    const upcoming = this.registrations.filter((r) => new Date(r.startDateTime) > now);
    if (upcoming.length === 0) return;

    const events = upcoming.map((r) => {
      const start = new Date(r.startDateTime);
      const end = new Date(r.endDateTime);
      const formatICS = (d: Date) =>
        d.getFullYear() +
        String(d.getMonth() + 1).padStart(2, '0') +
        String(d.getDate()).padStart(2, '0') +
        'T' +
        String(d.getHours()).padStart(2, '0') +
        String(d.getMinutes()).padStart(2, '0') +
        String(d.getSeconds()).padStart(2, '0');
      const title = (r.eventTitle || 'אירוע').replace(/[^\w\s\u0590-\u05FF\-]/g, '');
      return `BEGIN:VEVENT\nDTSTART:${formatICS(start)}\nDTEND:${formatICS(end)}\nSUMMARY:${title}\nEND:VEVENT`;
    }).join('\n');

    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Natalia Dojo//My Events//HE\n${events}\nEND:VCALENDAR`;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dojo-events-${new Date().toISOString().slice(0, 10)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
