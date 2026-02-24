import {
  Component,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '../../../_services/auth.service';
import {
  EventsService,
  Event,
  EventRegistrationDetailsResponse,
  UpdateEventAttendanceRequest,
} from '../../../_services/events.service';

const PAGE_SIZE = 10;
const EVENT_TYPES: { value: string; label: string }[] = [
  { value: '', label: 'הכל' },
  { value: 'seminar', label: 'סמינר' },
  { value: 'workshop', label: 'סדנה' },
  { value: 'grading', label: 'דרגות' },
  { value: 'social', label: 'חברתי' },
  { value: 'special_training', label: 'אימון מיוחד' },
  { value: 'online_session', label: 'מפגש אונליין' },
  { value: 'retreat', label: 'ריטריט' },
  { value: 'zen_session', label: 'מפגש זן' },
];
const EVENT_STATUSES: { value: string; label: string }[] = [
  { value: '', label: 'הכל' },
  { value: 'draft', label: 'טיוטה' },
  { value: 'published', label: 'פורסם' },
  { value: 'closed', label: 'סגור' },
];

/** API sortBy values: id, title, type, status, startDate, price */
type AdminSortBy = 'id' | 'title' | 'type' | 'status' | 'startDate' | 'price';

@Component({
  selector: 'app-events-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './events-management.component.html',
  styleUrl: './events-management.component.css',
})
export class EventsManagementComponent implements OnInit, OnDestroy {
  pagedEvents: Event[] = [];
  totalCount = 0;
  /** Event ID (string) -> registered count from API */
  registeredCountByEventId: Record<string, number> = {};
  isLoading = false;
  errorMessage = '';
  isAdmin = false;
  userInfo: UserInfo | null = null;

  sortField: 'title' | 'eventType' | 'status' | 'startDateTime' | 'price' | 'id' =
    'startDateTime';
  sortDirection: 'asc' | 'desc' = 'desc';
  filterType = '';
  filterStatus = '';
  filterTitle = '';

  page = 1;
  pageSize = PAGE_SIZE;
  totalPages = 0;

  /** Resend-email modal */
  selectedEvent: Event | null = null;
  eventRegistrations: EventRegistrationDetailsResponse[] = [];
  loadingRegistrations = false;
  registrationsError = '';
  resendLoadingId: number | null = null;
  resendMessage = '';
  /** Selected resend type per registration (registrationId -> type) */
  resendTypeByRegId: Record<number, 'confirmation' | 'payment_approval' | 'both'> = {};
  /** Local attendance state for modal (registrationId -> { attended }) */
  attendanceByRegId: Record<number, { attended: boolean }> = {};
  attendanceLoadingId: number | null = null;
  attendanceMessage = '';

  readonly eventTypes = EVENT_TYPES;
  readonly eventStatuses = EVENT_STATUSES;
  readonly resendTypes = [
    { value: 'confirmation' as const, label: 'אימייל אישור הרשמה' },
    { value: 'payment_approval' as const, label: 'אימייל אישור תשלום (ליוצר האירוע)' },
    { value: 'both' as const, label: 'שניהם' },
  ] as const;

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;
  /** Polling interval for registrations (email-sent timestamps) while modal is open. */
  private registrationsPollingInterval: ReturnType<typeof setInterval> | null = null;
  private readonly REGISTRATIONS_POLL_MS = 12_000;

  constructor(
    private authService: AuthService,
    private eventsService: EventsService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.userInfo = this.authService.getUserInfo();
    this.isAdmin = this.isAdminUser(this.userInfo);

    if (this.isAdmin) {
      this.loadEvents();
      const id = this.route.snapshot.paramMap.get('id');
      const eventId = id ? parseInt(id, 10) : NaN;
      if (!Number.isNaN(eventId)) {
        this.eventsService.getEventById(eventId, true).subscribe({
          next: (ev) => this.openResendModal(ev),
          error: () => { /* event may not exist or no auth; list still shown */ },
        });
      }
    }

    this.authSubscription = this.authService.token$.subscribe((token) => {
      if (!token) {
        this.pagedEvents = [];
        this.isAdmin = false;
      }
    });

    this.userSubscription = this.authService.userInfo$.subscribe((userInfo) => {
      this.userInfo = userInfo;
      this.isAdmin = this.isAdminUser(userInfo);
      if (this.isAdmin) this.loadEvents();
      else this.pagedEvents = [];
    });
  }

  ngOnDestroy(): void {
    this.stopRegistrationsPolling();
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  /** Map UI sort field to API sortBy (startDateTime -> startDate, eventType -> type) */
  private getApiSortBy(): AdminSortBy {
    if (this.sortField === 'startDateTime') return 'startDate';
    if (this.sortField === 'eventType') return 'type';
    return this.sortField as AdminSortBy;
  }

  loadEvents(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.eventsService
      .getAdminEvents({
        sortBy: this.getApiSortBy(),
        sortOrder: this.sortDirection,
        search: this.filterTitle || undefined,
        type: this.filterType || undefined,
        status: this.filterStatus || undefined,
        page: this.page,
        pageSize: this.pageSize
      })
      .subscribe({
        next: (res) => {
          this.pagedEvents = res.items ?? [];
          this.totalCount = res.totalCount ?? 0;
          this.registeredCountByEventId = res.registeredCountByEventId ?? {};
          this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.pagedEvents = [];
          this.totalCount = 0;
          this.registeredCountByEventId = {};
          this.totalPages = 0;
          if (err.status === 403 || err.status === 401) {
            this.errorMessage = 'אין הרשאה לצפות באירועים.';
          } else if (err.status === 0) {
            this.errorMessage = 'לא ניתן להתחבר לשרת. אנא נסה שוב.';
          } else {
            this.errorMessage = 'שגיאה בטעינת האירועים. נסו שוב מאוחר יותר.';
          }
        },
      });
  }

  private isAdminUser(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role ?? '').trim().toLowerCase();
    return role === 'admin';
  }

  setSort(field: typeof this.sortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.page = 1;
    this.loadEvents();
  }

  onFilterChange(): void {
    this.page = 1;
    this.loadEvents();
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadEvents();
  }

  trackByEventId(_index: number, e: Event): number {
    return e.id;
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

  /** Date only (dd/MM/yyyy) for table display. */
  formatDateOnly(dateStr: string | null): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return '—';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '—';
    }
  }

  /** Number of days between event start and end (at least 1 for same-day). */
  getEventDays(ev: Event): number | string {
    if (!ev.startDateTime || !ev.endDateTime) return '—';
    try {
      const start = new Date(ev.startDateTime).getTime();
      const end = new Date(ev.endDateTime).getTime();
      if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '—';
      const days = Math.ceil((end - start) / (24 * 60 * 60 * 1000));
      return days < 1 ? 1 : days;
    } catch {
      return '—';
    }
  }

  getTypeLabel(type: string | null): string {
    if (!type) return '—';
    const t = type.toString().toLowerCase();
    const found = EVENT_TYPES.find((x) => x.value === t);
    return found ? found.label : type;
  }

  getStatusLabel(status: string | null): string {
    if (!status) return '—';
    const s = status.toString().toLowerCase();
    const found = EVENT_STATUSES.find((x) => x.value === s);
    return found ? found.label : status;
  }

  getPriceDisplay(ev: Event): string | number {
    return ev.price != null ? ev.price : '—';
  }

  /** Registered count for event from API (registeredCountByEventId). */
  getRegisteredCount(eventId: number): number {
    const key = String(eventId);
    return this.registeredCountByEventId[key] ?? 0;
  }

  goToEvent(id: number): void {
    this.router.navigate(['/events', id], { queryParams: { from: 'admin-events' } });
  }

  openResendModal(ev: Event): void {
    this.stopRegistrationsPolling();
    this.selectedEvent = ev;
    this.eventRegistrations = [];
    this.registrationsError = '';
    this.resendMessage = '';
    this.resendLoadingId = null;
    this.loadingRegistrations = true;
    this.eventsService.getEventRegistrations(ev.id).subscribe({
      next: (list) => {
        this.eventRegistrations = list ?? [];
        this.attendanceByRegId = {};
        (this.eventRegistrations || []).forEach((r) => {
          this.attendanceByRegId[r.registrationId] = { attended: !!r.attended };
        });
        this.loadingRegistrations = false;
        this.startRegistrationsPolling();
      },
      error: () => {
        this.registrationsError = 'שגיאה בטעינת ההרשמות.';
        this.loadingRegistrations = false;
        this.startRegistrationsPolling();
      },
    });
  }

  closeResendModal(): void {
    this.stopRegistrationsPolling();
    this.selectedEvent = null;
    this.eventRegistrations = [];
    this.registrationsError = '';
    this.resendMessage = '';
    this.resendLoadingId = null;
    this.resendTypeByRegId = {};
    this.attendanceByRegId = {};
    this.attendanceLoadingId = null;
    this.attendanceMessage = '';
  }

  getAttendance(reg: EventRegistrationDetailsResponse): boolean {
    return this.attendanceByRegId[reg.registrationId]?.attended ?? !!reg.attended;
  }

  setAttendance(registrationId: number, attended: boolean): void {
    this.attendanceByRegId = {
      ...this.attendanceByRegId,
      [registrationId]: { attended },
    };
  }

  saveAttendance(reg: EventRegistrationDetailsResponse): void {
    if (!this.selectedEvent) return;
    const attended = this.getAttendance(reg);
    const body: UpdateEventAttendanceRequest = {
      attended,
      checkedInAt: attended ? new Date().toISOString() : null,
    };
    this.attendanceMessage = '';
    this.attendanceLoadingId = reg.registrationId;
    this.eventsService
      .updateRegistrationAttendance(this.selectedEvent.id, reg.registrationId, body)
      .subscribe({
        next: (updated) => {
          const idx = this.eventRegistrations.findIndex((r) => r.registrationId === reg.registrationId);
          if (idx !== -1) {
            this.eventRegistrations = [...this.eventRegistrations];
            this.eventRegistrations[idx] = {
              ...this.eventRegistrations[idx],
              attended: updated.attended,
              checkedInAt: updated.checkedInAt ?? null,
            };
          }
          this.attendanceByRegId[reg.registrationId] = { attended: updated.attended };
          this.attendanceMessage = 'נוכחות נשמרה.';
          this.attendanceLoadingId = null;
        },
        error: () => {
          this.attendanceMessage = 'שגיאה בשמירת נוכחות.';
          this.attendanceLoadingId = null;
        },
      });
  }

  getResendType(reg: EventRegistrationDetailsResponse): 'confirmation' | 'payment_approval' | 'both' {
    return this.resendTypeByRegId[reg.registrationId] ?? 'both';
  }

  setResendType(registrationId: number, type: 'confirmation' | 'payment_approval' | 'both'): void {
    this.resendTypeByRegId = { ...this.resendTypeByRegId, [registrationId]: type };
  }

  resendEmail(
    reg: EventRegistrationDetailsResponse,
    type: 'confirmation' | 'payment_approval' | 'both'
  ): void {
    if (!this.selectedEvent) return;
    this.resendMessage = '';
    this.resendLoadingId = reg.registrationId;
    this.eventsService
      .resendRegistrationEmail(this.selectedEvent.id, reg.registrationId, type)
      .subscribe({
        next: (res) => {
          this.resendMessage = (res as { message?: string })?.message ?? 'בקשת שליחה נשלחה. המיילים יישלחו ברקע.';
          this.resendLoadingId = null;
          this.reloadRegistrationsInModal();
        },
        error: (err) => {
          this.resendMessage =
            err?.error?.message ?? err?.message ?? 'שגיאה בשליחת המייל. נסה שוב.';
          this.resendLoadingId = null;
        },
      });
  }

  /** Reload registrations in the open modal to refresh email-sent timestamps. */
  private reloadRegistrationsInModal(): void {
    if (!this.selectedEvent) return;
    this.eventsService.getEventRegistrations(this.selectedEvent.id).subscribe({
      next: (list) => {
        this.eventRegistrations = list ?? [];
        this.attendanceByRegId = {};
        (this.eventRegistrations || []).forEach((r) => {
          this.attendanceByRegId[r.registrationId] = { attended: !!r.attended };
        });
      },
    });
  }

  private startRegistrationsPolling(): void {
    this.stopRegistrationsPolling();
    if (!this.selectedEvent) return;
    this.registrationsPollingInterval = setInterval(() => {
      this.reloadRegistrationsInModal();
    }, this.REGISTRATIONS_POLL_MS);
  }

  private stopRegistrationsPolling(): void {
    if (this.registrationsPollingInterval != null) {
      clearInterval(this.registrationsPollingInterval);
      this.registrationsPollingInterval = null;
    }
  }

  trackByRegistrationId(_i: number, r: EventRegistrationDetailsResponse): number {
    return r.registrationId;
  }

  getRegDisplayName(reg: EventRegistrationDetailsResponse): string {
    return reg.username || reg.email || '—';
  }

  /** Display email sent timestamp or "לא נשלח" for admin modal. */
  formatEmailSentAt(sentAt: string | null | undefined): string {
    if (!sentAt) return 'לא נשלח';
    return this.formatDate(sentAt);
  }
}
