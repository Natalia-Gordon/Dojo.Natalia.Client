import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '../../../_services/auth.service';
import {
  EventsService,
  Event,
  EventRegistrationDetailsResponse,
} from '../../../_services/events.service';

@Component({
  selector: 'app-registration-approve',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registration-approve.component.html',
  styleUrl: './registration-approve.component.css',
})
export class RegistrationApproveComponent implements OnInit, OnDestroy {
  eventId: number | null = null;
  registrationId: number | null = null;
  event: Event | null = null;
  registration: EventRegistrationDetailsResponse | null = null;
  isLoading = true;
  errorMessage = '';
  message = '';
  approvalNotes = '';
  approveLoading = false;
  rejectLoading = false;
  isAdminOrInstructor = false;
  userInfo: UserInfo | null = null;
  /** When true, breadcrumb shows full path: דף הבית / ניהול אירועים / נרשמו לאירוע (from query param from=event-registrations). */
  fromEventRegistrations = false;

  private queryParamSubscription?: Subscription;

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
    const eventIdParam = this.route.snapshot.paramMap.get('eventId');
    const regIdParam = this.route.snapshot.paramMap.get('registrationId');
    this.eventId = eventIdParam ? parseInt(eventIdParam, 10) : null;
    this.registrationId = regIdParam ? parseInt(regIdParam, 10) : null;
    if (this.eventId == null || this.registrationId == null || Number.isNaN(this.eventId) || Number.isNaN(this.registrationId)) {
      this.errorMessage = 'כתובת לא תקינה.';
      this.isLoading = false;
      return;
    }
    this.fromEventRegistrations = this.route.snapshot.queryParams['from'] === 'event-registrations';
    this.queryParamSubscription = this.route.queryParams.subscribe((q) => {
      this.fromEventRegistrations = q['from'] === 'event-registrations';
    });

    this.eventsService.getEventById(this.eventId, true).subscribe({
      next: (ev) => {
        this.event = ev;
        this.loadRegistration();
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.status === 401 || err?.status === 403) {
          this.errorMessage = 'אין הרשאה לצפות בדף זה. התחבר כמנהל או מדריך.';
        } else if (err?.status === 404) {
          this.errorMessage = 'אירוע לא נמצא.';
        } else {
          this.errorMessage = 'שגיאה בטעינת האירוע.';
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.queryParamSubscription?.unsubscribe();
  }

  private canApprovePayments(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role ?? '').trim().toLowerCase();
    return role === 'admin' || role === 'instructor';
  }

  private loadRegistration(): void {
    if (this.eventId == null) return;
    this.eventsService.getEventRegistrations(this.eventId).subscribe({
      next: (list) => {
        const reg = (list ?? []).find((r) => r.registrationId === this.registrationId);
        this.registration = reg ?? null;
        this.isLoading = false;
        if (!this.registration) this.errorMessage = 'הרשמה לא נמצאה.';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'שגיאה בטעינת פרטי ההרשמה.';
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

  getRegDisplayName(): string {
    if (!this.registration) return '—';
    const r = this.registration;
    const name = [r.username, r.email].filter(Boolean).join(' / ');
    return name || `משתמש #${r.userId}`;
  }

  getPaymentStatusLabel(): string {
    if (!this.registration) return '—';
    const s = (this.registration.paymentStatus ?? '').toLowerCase();
    if (s === 'pending') return 'ממתין לאישור';
    if (s === 'paid') return 'שולם';
    if (s === 'failed' || s === 'rejected') return 'נדחה';
    if (s === 'free') return 'חינם';
    return this.registration.paymentStatus ?? '—';
  }

  canApprove(): boolean {
    return this.registration != null && (this.registration.paymentStatus ?? '').toLowerCase() === 'pending';
  }

  approve(): void {
    if (this.eventId == null || this.registrationId == null || !this.canApprove()) return;
    this.message = '';
    this.approveLoading = true;
    this.eventsService.approvePaymentRegistration(this.eventId, this.registrationId, {
      approved: true,
      approvalNotes: this.approvalNotes.trim() || undefined,
    }).subscribe({
      next: () => {
        this.approveLoading = false;
        this.message = 'התשלום אושר בהצלחה.';
        this.registration = this.registration ? { ...this.registration, paymentStatus: 'paid' } : null;
      },
      error: (err) => {
        this.approveLoading = false;
        this.errorMessage = err?.error?.message ?? err?.message ?? 'שגיאה באישור התשלום.';
      },
    });
  }

  reject(): void {
    if (this.eventId == null || this.registrationId == null || !this.canApprove()) return;
    this.message = '';
    this.rejectLoading = true;
    this.eventsService.approvePaymentRegistration(this.eventId, this.registrationId, {
      approved: false,
      approvalNotes: this.approvalNotes.trim() || undefined,
    }).subscribe({
      next: () => {
        this.rejectLoading = false;
        this.message = 'התשלום נדחה.';
        this.registration = this.registration ? { ...this.registration, paymentStatus: 'rejected' } : null;
      },
      error: (err) => {
        this.rejectLoading = false;
        this.errorMessage = err?.error?.message ?? err?.message ?? 'שגיאה בדחיית התשלום.';
      },
    });
  }

  goToEventRegistrations(): void {
    if (this.eventId != null) this.router.navigate(['/admin/events', this.eventId, 'registrations']);
  }

  goToEvent(): void {
    if (this.eventId != null) this.router.navigate(['/events', this.eventId]);
  }
}
