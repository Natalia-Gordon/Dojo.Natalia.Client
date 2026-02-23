import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '../../../_services/auth.service';
import {
  EventsService,
  Event,
  EventRegistrationDetailsResponse,
  EventRegistrationsFilters,
} from '../../../_services/events.service';

@Component({
  selector: 'app-event-registrations',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './event-registrations.component.html',
  styleUrl: './event-registrations.component.css',
})
export class EventRegistrationsComponent implements OnInit, OnDestroy {
  eventId: number | null = null;
  event: Event | null = null;
  registrations: EventRegistrationDetailsResponse[] = [];
  isLoading = false;
  errorMessage = '';
  message = '';
  isAdminOrInstructor = false;
  userInfo: UserInfo | null = null;

  approveLoadingId: number | null = null;
  rejectLoadingId: number | null = null;
  approvalNotesByRegId: Record<number, string> = {};
  exportCsvLoading = false;

  /** Optional filters for GET registrations (firstName, lastName, phone). */
  filterFirstName = '';
  filterLastName = '';
  filterPhone = '';

  private routeSubscription?: Subscription;
  private authSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private eventsService: EventsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.userInfo = this.authService.getUserInfo();
    this.isAdminOrInstructor = this.canApprovePayments(this.userInfo);

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('eventId') ?? params.get('id');
      const parsed = id ? parseInt(id, 10) : NaN;
      if (Number.isNaN(parsed)) {
        this.eventId = null;
        this.event = null;
        this.registrations = [];
        return;
      }
      this.eventId = parsed;
      this.loadEventAndRegistrations();
    });

    this.authSubscription = this.authService.token$.subscribe((token) => {
      if (!token) {
        this.registrations = [];
        this.isAdminOrInstructor = false;
      } else {
        this.userInfo = this.authService.getUserInfo();
        this.isAdminOrInstructor = this.canApprovePayments(this.userInfo);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
  }

  private canApprovePayments(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role ?? '').trim().toLowerCase();
    return role === 'admin' || role === 'instructor';
  }

  private loadEventAndRegistrations(): void {
    if (this.eventId == null) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.message = '';

    this.eventsService.getEventById(this.eventId, true).subscribe({
      next: (ev) => {
        this.event = ev;
        this.loadRegistrations();
      },
      error: (err) => {
        this.isLoading = false;
        this.event = null;
        if (err?.status === 401 || err?.status === 403) {
          this.errorMessage = 'אין הרשאה לצפות באירוע זה.';
        } else if (err?.status === 404) {
          this.errorMessage = 'אירוע לא נמצא.';
        } else {
          this.errorMessage = 'שגיאה בטעינת האירוע. נסה שוב.';
        }
      },
    });
  }

  private loadRegistrations(): void {
    if (this.eventId == null) return;
    const filters: EventRegistrationsFilters = {};
    if (this.filterFirstName.trim() !== '') filters.firstName = this.filterFirstName.trim();
    if (this.filterLastName.trim() !== '') filters.lastName = this.filterLastName.trim();
    if (this.filterPhone.trim() !== '') filters.phone = this.filterPhone.trim();
    this.eventsService.getEventRegistrations(this.eventId, Object.keys(filters).length > 0 ? filters : undefined).subscribe({
      next: (list) => {
        this.registrations = list ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.registrations = [];
        this.isLoading = false;
        this.errorMessage = this.errorMessage || 'שגיאה בטעינת ההרשמות.';
      },
    });
  }

  onFilterChange(): void {
    if (this.eventId == null) return;
    this.loadRegistrations();
  }

  goBack(): void {
    this.router.navigate(['/admin/events']);
  }

  exportCsv(): void {
    if (this.eventId == null || this.exportCsvLoading) return;
    this.exportCsvLoading = true;
    this.errorMessage = '';
    this.eventsService.getEventRegistrationsCsv(this.eventId).subscribe({
      next: (blob) => {
        this.exportCsvLoading = false;
        if (typeof window === 'undefined' || !window.URL) return;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `registrations-event-${this.eventId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.exportCsvLoading = false;
        this.errorMessage = err?.error?.message ?? err?.message ?? 'שגיאה בייצוא הקובץ.';
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

  getRegDisplayName(reg: EventRegistrationDetailsResponse): string {
    const first = (reg.firstName ?? '').trim();
    const last = (reg.lastName ?? '').trim();
    if (first || last) {
      const full = [first, last].filter(Boolean).join(' ').trim();
      if (full) return full;
    }
    const name = [reg.username, reg.email].filter(Boolean).join(' / ');
    return name || `משתמש #${reg.userId}`;
  }

  getPaymentStatusLabel(status: string | null): string {
    if (!status) return '—';
    const s = (status ?? '').toLowerCase();
    if (s === 'pending') return 'ממתין';
    if (s === 'paid') return 'שולם';
    if (s === 'failed' || s === 'rejected') return 'נדחה';
    if (s === 'free') return 'חינם';
    return status;
  }

  getApprovalNotesForDisplay(registrationId: number): string {
    const v = this.approvalNotesByRegId[registrationId];
    return v !== undefined ? v : '';
  }

  setApprovalNotes(registrationId: number, notes: string): void {
    this.approvalNotesByRegId = {
      ...this.approvalNotesByRegId,
      [registrationId]: notes,
    };
  }

  getApprovalNotes(registrationId: number): string {
    return (this.approvalNotesByRegId[registrationId] ?? '').trim();
  }

  isPending(reg: EventRegistrationDetailsResponse): boolean {
    return (reg.paymentStatus ?? '').toLowerCase() === 'pending';
  }

  approvePayment(reg: EventRegistrationDetailsResponse): void {
    if (this.eventId == null) return;
    this.message = '';
    this.approveLoadingId = reg.registrationId;
    this.eventsService
      .approvePaymentRegistration(this.eventId, reg.registrationId, {
        approved: true,
        approvalNotes: this.getApprovalNotes(reg.registrationId) || undefined,
      })
      .subscribe({
        next: () => {
          this.approveLoadingId = null;
          this.message = 'התשלום אושר.';
          delete this.approvalNotesByRegId[reg.registrationId];
          this.loadRegistrations();
        },
        error: (err) => {
          this.approveLoadingId = null;
          const msg = err?.error?.message ?? err?.message;
          this.errorMessage = msg ?? 'שגיאה באישור התשלום.';
        },
      });
  }

  rejectPayment(reg: EventRegistrationDetailsResponse): void {
    if (this.eventId == null) return;
    this.message = '';
    this.rejectLoadingId = reg.registrationId;
    this.eventsService
      .approvePaymentRegistration(this.eventId, reg.registrationId, {
        approved: false,
        approvalNotes: this.getApprovalNotes(reg.registrationId) || undefined,
      })
      .subscribe({
        next: () => {
          this.rejectLoadingId = null;
          this.message = 'התשלום נדחה.';
          delete this.approvalNotesByRegId[reg.registrationId];
          this.loadRegistrations();
        },
        error: (err) => {
          this.rejectLoadingId = null;
          const msg = err?.error?.message ?? err?.message;
          this.errorMessage = msg ?? 'שגיאה בדחיית התשלום.';
        },
      });
  }

  trackByRegistrationId(_i: number, reg: EventRegistrationDetailsResponse): number {
    return reg.registrationId;
  }

  getPaymentDetailsUrl(reg: EventRegistrationDetailsResponse): string {
    return this.eventId != null ? `/events/${this.eventId}/registrations/${reg.registrationId}/approve` : '#';
  }
}
