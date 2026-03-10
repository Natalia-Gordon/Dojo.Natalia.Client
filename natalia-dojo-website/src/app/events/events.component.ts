import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';
import { AuthService, UserInfo } from '../_services/auth.service';
import { EventsService, Event } from '../_services/events.service';
import { InstructorsService } from '../_services/instructors.service';
import { EventsHeroComponent } from './events-hero/events-hero.component';

export type EventPaymentMethodType = 'bit' | 'bank_transfer' | 'cash';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, EventsHeroComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isAuthenticated = false;
  isAdminOrInstructor = false;
  userInfo: UserInfo | null = null;

  /** instructorId -> display name (loaded after events). */
  instructorNamesMap: Record<number, string> = {};
  /** instructorId -> payment types (bit, bank_transfer); cash shown when price > 0. */
  instructorPaymentMethodsMap: Record<number, ('bit' | 'bank_transfer')[]> = {};
  /** Event ID -> registered count (loaded via admin API for admin/instructor only). */
  registeredCountByEventId: Record<string, number> = {};

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private eventsService: EventsService,
    private instructorsService: InstructorsService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Only make API calls in browser, not during SSR/prerendering
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isAuthenticated = this.authService.isAuthenticated();
    this.userInfo = this.authService.getUserInfo();
    this.isAdminOrInstructor = this.isAllowedToManageEvents(this.userInfo);

    // Load events for all users (public)
    this.loadEvents();

    this.authSubscription = this.authService.token$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (!token) {
        this.userInfo = null;
        this.isAdminOrInstructor = false;
      }
      // Reload events when authentication state changes (to show unpublished if admin)
      this.loadEvents();
    });

    this.userSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
      this.isAdminOrInstructor = this.isAllowedToManageEvents(userInfo);
      // Reload events when user info changes (to show unpublished if admin/instructor)
      this.loadEvents();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  loadEvents(): void {
    // Only make API calls in browser, not during SSR/prerendering
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.eventsService.getEvents({
        includeUnpublished: this.isAdminOrInstructor, // Only admin/instructor can see unpublished events
        type: 'Seminar'
      }).subscribe({
        next: (events) => {
          this.events = events || [];
          this.isLoading = false;
          // Load instructor names (and payment methods) for admin/instructor; others use event.instructorName from API when present
          if (this.isAdminOrInstructor) {
            this.loadInstructorsForEvents(this.events);
            this.loadRegisteredCountsForEvents(this.events);
          } else {
            this.registeredCountByEventId = {};
          }
        },
        error: (error) => {
          this.isLoading = false;
          // Handle 503 Service Unavailable with specific message
          if (error.status === 503) {
            this.errorMessage = 'השירות זמנית לא זמין. אנא נסי שוב בעוד כמה רגעים.';
          } else if (error.status === 0) {
            // Network error - backend not available
            this.errorMessage = 'לא ניתן להתחבר לשרת. אנא ודאי שהשרת פועל ונסי שוב.';
          } else {
            this.errorMessage = 'שגיאה בטעינת האירועים. נסו שוב מאוחר יותר.';
          }
        }
      });
    } catch (error) {
      // Fallback for any unexpected errors during SSR
      this.isLoading = false;
      this.errorMessage = 'שגיאה בטעינת האירועים. נסו שוב מאוחר יותר.';
    }
  }

  trackByEventId(index: number, eventItem: Event): number {
    return eventItem.id;
  }

  /** Hebrew label for event type. */
  getEventTypeLabel(eventType: string | null | undefined): string {
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

  /** Formatted date and time for list display (e.g. 15/03/2025 09:00). */
  formatDateTime(dateStr: string | null | undefined): string {
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

  /** Price in ILS for display. */
  getFormattedPrice(amount: number | null | undefined): string {
    if (amount == null) return '—';
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  }

  /** Whether early bird pricing is still available. */
  isEarlyBirdAvailable(eventItem: Event): boolean {
    if (!eventItem?.earlyBirdDeadline) return false;
    return new Date(eventItem.earlyBirdDeadline) > new Date();
  }

  /** Registration deadline formatted, or empty if none. */
  formatRegistrationDeadline(deadline: string | null | undefined): string {
    if (!deadline) return '';
    return this.formatDateTime(deadline);
  }

  /** Status badge text: "פתוח להרשמה עד [date]" when open and deadline set, else "פתוח להרשמה" / "הרשמה סגורה". */
  getRegistrationStatusText(eventItem: Event): string {
    if (!eventItem?.registrationOpen) return 'הרשמה סגורה';
    const deadline = eventItem.registrationDeadline ? this.formatRegistrationDeadline(eventItem.registrationDeadline) : '';
    return deadline ? `פתוח להרשמה עד ${deadline}` : 'פתוח להרשמה';
  }

  getInstructorName(instructorId: number | null | undefined): string {
    if (instructorId == null) return '—';
    return this.instructorNamesMap[instructorId] ?? '—';
  }

  /** Prefer instructorName from the event (from API list), then instructorNamesMap (for admin/instructor). */
  getInstructorDisplayName(eventItem: Event): string {
    if (eventItem?.instructorName != null && eventItem.instructorName !== '') {
      return eventItem.instructorName;
    }
    if (eventItem?.instructorId == null) return '—';
    return this.instructorNamesMap[eventItem.instructorId] ?? '—';
  }

  /**
   * Payment method types to show as icons for this event.
   * Event payment methods = event creator's (instructor's) payment methods:
   * GET /api/events/{id} → instructorId, then GET /api/instructors/{instructorId} → paymentMethods
   * (Bit, bank transfer, etc.). Cash is added for paid events as it is typically offered.
   */
  getPaymentMethodTypes(eventItem: Event): EventPaymentMethodType[] {
    const list: EventPaymentMethodType[] = [];
    const instructorId = eventItem?.instructorId;
    if (instructorId != null && this.instructorPaymentMethodsMap[instructorId]) {
      list.push(...this.instructorPaymentMethodsMap[instructorId]);
    }
    if (eventItem?.price != null && eventItem.price > 0 && !list.includes('cash')) {
      list.push('cash');
    }
    return list;
  }

  getPaymentMethodIcon(type: EventPaymentMethodType): string {
    const map: Record<EventPaymentMethodType, string> = {
      bit: 'bi-wallet2',
      bank_transfer: 'bi-bank',
      cash: 'bi-cash'
    };
    return map[type] ?? 'bi-currency-exchange';
  }

  getPaymentMethodLabel(type: EventPaymentMethodType): string {
    const map: Record<EventPaymentMethodType, string> = {
      bit: 'ביט',
      bank_transfer: 'העברה בנקאית',
      cash: 'מזומן'
    };
    return map[type] ?? type;
  }

  /**
   * Load instructor details for events that have instructorId.
   * Event payment methods = instructor's paymentMethods (and legacy bank fields).
   * Flow: GET /api/events → instructorId → GET /api/instructors/{id} → paymentMethods.
   */
  private loadInstructorsForEvents(events: Event[]): void {
    const ids = [...new Set(events.map(e => e.instructorId).filter((id): id is number => id != null))];
    this.instructorNamesMap = {};
    this.instructorPaymentMethodsMap = {};
    if (ids.length === 0) return;
    forkJoin(ids.map(id => this.instructorsService.getInstructorById(id))).subscribe({
      next: (instructors) => {
        ids.forEach((id, i) => {
          const inst = instructors[i];
          this.instructorNamesMap[id] = inst?.displayName || inst?.username || 'מדריך';
          this.instructorPaymentMethodsMap[id] = (inst?.paymentMethods ?? []).map(m => m.paymentType);
        });
      }
    });
  }

  private isAllowedToManageEvents(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role || '').toLowerCase();
    return role === 'admin' || role === 'instructor';
  }

  /**
   * Registered count for event (admin/instructor only; from getAdminEvents registeredCountByEventId).
   */
  getRegisteredCount(eventId: number): number {
    return this.registeredCountByEventId[String(eventId)] ?? 0;
  }

  /**
   * Fetch registration counts for current event list (admin API returns map for paged items).
   * Uses a large pageSize so counts align with listed events when possible.
   */
  private loadRegisteredCountsForEvents(events: Event[]): void {
    if (events.length === 0) {
      this.registeredCountByEventId = {};
      return;
    }
    this.eventsService
      .getAdminEvents({
        type: 'seminar',
        page: 1,
        pageSize: Math.max(200, events.length + 50),
        sortBy: 'startDate',
        sortOrder: 'desc'
      })
      .subscribe({
        next: (res) => {
          this.registeredCountByEventId = res.registeredCountByEventId ?? {};
        },
        error: () => {
          this.registeredCountByEventId = {};
        }
      });
  }
}
