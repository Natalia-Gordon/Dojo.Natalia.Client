import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { EventsService, Event } from '../../_services/events.service';
import { AuthService, UserInfo } from '../../_services/auth.service';
import { InstructorsService } from '../../_services/instructors.service';
import { LoginModalService } from '../../_services/login-modal.service';
import { EventDetailHeroComponent } from './event-detail-hero/event-detail-hero.component';
import { EventRegistrationDialogComponent } from '../../core/templates/event-registration-dialog/event-registration-dialog.component';
import { getDriveFileId, getProfileImageUrlForAttempt } from '../../_utils/profile-image';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EventDetailHeroComponent, EventRegistrationDialogComponent],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isAuthenticated = false;
  isAdminOrInstructor = false;
  userInfo: UserInfo | null = null;
  imageLoadAttempt = 0;
  private imageId: string | null = null;
  displayImageUrl: string = ''; // Pre-computed image URL for SSR safety
  isBrowser = false; // Platform check for template
  instructorName: string | null = null;
  /** When true, event detail hero shows "ניהול אירועים" in breadcrumb (from query param from=admin-events). */
  fromEventsManagement = false;
  /** When true, breadcrumb shows "אירועים שלי" link back to my-events (from query param from=my-events). */
  fromMyEvents = false;
  /** True when current user may open edit page (admin or event's instructor). */
  canEditEvent = false;

  private routeSubscription?: Subscription;
  private queryParamSubscription?: Subscription;
  private authSubscription?: Subscription;
  private userInfoSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private authService: AuthService,
    private loginModalService: LoginModalService,
    private instructorsService: InstructorsService,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only make API calls in browser, not during SSR/prerendering
    if (!this.isBrowser) {
      return;
    }

    this.isAuthenticated = this.authService.isAuthenticated();
    this.userInfo = this.authService.getUserInfo();
    this.isAdminOrInstructor = this.isAllowedToManageEvents(this.userInfo);

    this.authSubscription = this.authService.token$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (!token) {
        this.userInfo = null;
        this.isAdminOrInstructor = false;
      }
    });

    this.userInfoSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
      this.isAdminOrInstructor = this.isAllowedToManageEvents(userInfo);
      // Reload event if user info changes (to get unpublished events if admin/instructor)
      const eventId = this.route.snapshot.params['id'];
      if (eventId) {
        this.loadEvent(+eventId);
      }
    });

    this.routeSubscription = this.route.params.subscribe(params => {
      const eventId = +params['id'];
      if (eventId) {
        this.loadEvent(eventId);
      }
    });

    this.queryParamSubscription = this.route.queryParams.subscribe(q => {
      this.fromEventsManagement = q['from'] === 'admin-events';
      this.fromMyEvents = q['from'] === 'my-events';
    });
    this.fromEventsManagement = this.route.snapshot.queryParams['from'] === 'admin-events';
    this.fromMyEvents = this.route.snapshot.queryParams['from'] === 'my-events';
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.queryParamSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.userInfoSubscription?.unsubscribe();
  }

  loadEvent(eventId: number): void {
    // Only make API calls in browser, not during SSR/prerendering
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // If user is admin/instructor, send auth headers to potentially see unpublished events
    const requireAuth = this.isAdminOrInstructor;

    try {
      this.eventsService.getEventById(eventId, requireAuth).subscribe({
      next: (event) => {
        this.event = event;
        this.canEditEvent = false;
        this.instructorName = event.instructorName ?? null;
        this.computeCanEditEvent(event);
        // Support both camelCase and snake_case from API
        const imageUrl = event.imageUrl ?? (event as { image_url?: string | null }).image_url ?? null;
        if (event && !(event as { imageUrl?: string | null }).imageUrl && imageUrl) {
          (event as { imageUrl?: string }).imageUrl = imageUrl;
        }
        // Compute image URL only in browser; use shared Drive URL conversion so event picture displays
        // Prefer uc?export=view first (attempt 1) - often works when thumbnail is blocked by referrer/CORS
        if (isPlatformBrowser(this.platformId) && imageUrl) {
          this.imageLoadAttempt = 1;
          this.imageId = getDriveFileId(imageUrl);
          const directUrl = getProfileImageUrlForAttempt(imageUrl, 1, 'w1920');
          this.displayImageUrl = directUrl || imageUrl.trim();
        } else {
          this.displayImageUrl = imageUrl || '';
        }
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: (error) => {
        this.isLoading = false;
        
        // Only log non-network and non-503 errors to reduce console noise
        if (error.status !== 0 && error.status !== 503) {
          console.error('Failed to load event:', error);
        }
        
        // Provide user-friendly error messages
        if (error.status === 503) {
          // Service Unavailable - database connection issues
          this.errorMessage = 'השירות זמנית לא זמין. אנא נסי שוב בעוד כמה רגעים.';
        } else if (error.status === 0) {
          // Network error - backend not available
          this.errorMessage = 'לא ניתן להתחבר לשרת. אנא ודאי שהשרת פועל ונסי שוב.';
        } else if (error.status === 404) {
          this.errorMessage = 'האירוע לא נמצא.';
        } else if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'אין הרשאה לצפות באירוע זה.';
        } else {
          this.errorMessage = 'שגיאה בטעינת האירוע. אנא נסי שוב מאוחר יותר.';
        }
      }
    });
    } catch (error) {
      // Fallback for any unexpected errors during SSR
      this.isLoading = false;
      this.errorMessage = 'שגיאה בטעינת האירוע. אנא נסי שוב מאוחר יותר.';
    }
  }

  enroll(): void {
    if (!this.event) return;

    if (!this.isAuthenticated || !this.userInfo?.userId) {
      this.authService.clearSessionLocally();
      this.loginModalService.open('login');
      this.errorMessage = 'אנא התחברי או הירשמי כדי להירשם לסמינר.';
      return;
    }

    // Open registration dialog
    this.eventsService.openRegistrationDialog(this.event);
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  /**
   * Resolve display URL for event image. Uses shared Drive conversion so Google Drive links work in <img>.
   */
  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    if (!isPlatformBrowser(this.platformId)) return '';
    const trimmed = imageUrl.trim();
    if (!trimmed) return '';
    this.imageId = getDriveFileId(trimmed);
    this.imageLoadAttempt = 0;
    const direct = getProfileImageUrlForAttempt(trimmed, 0, 'w1920');
    return direct || trimmed;
  }

  /**
   * Handle successful image load
   */
  onImageLoad(event: any): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.parentElement) {
      imgElement.parentElement.style.display = 'flex';
    }
  }

  /**
   * Handle image load error - try alternative Google Drive URL formats (same as profile images).
   * Order tried: 1 (uc?export=view), then 0 (thumbnail), then 2 (uc?export=download).
   */
  onImageError(event: ErrorEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const imgElement = event.target as HTMLImageElement;
    if (!imgElement || !this.event?.imageUrl) return;

    const rawUrl = this.event.imageUrl.trim();
    // Next attempt in order: 1 -> 0 -> 2 -> give up
    const nextAttempt = this.imageLoadAttempt === 1 ? 0 : this.imageLoadAttempt === 0 ? 2 : -1;
    const nextUrl = nextAttempt >= 0 ? getProfileImageUrlForAttempt(rawUrl, nextAttempt, 'w1920') : null;

    if (nextUrl) {
      this.imageLoadAttempt = nextAttempt;
      imgElement.src = nextUrl;
      return;
    }

    this.showDriveLinkOnly(imgElement);
  }

  /**
   * Show link to open image in Google Drive. Do not embed iframe (Drive CSP: frame-ancestors https://drive.google.com).
   */
  private showDriveLinkOnly(imgElement: HTMLImageElement): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.imageId) {
      this.showErrorMessage(imgElement);
      return;
    }

    const container = imgElement.parentElement;
    if (!container) return;

    imgElement.style.display = 'none';
    if (container.querySelector('.drive-image-error')) return;

    const linkWrap = document.createElement('div');
    linkWrap.className = 'drive-image-error';
    linkWrap.style.cssText = 'padding: 1.5rem; text-align: center; background: #f8f9fa; border-radius: 8px;';
    const driveLink = document.createElement('a');
    driveLink.href = `https://drive.google.com/file/d/${this.imageId}/view`;
    driveLink.target = '_blank';
    driveLink.rel = 'noopener noreferrer';
    driveLink.textContent = 'לצפייה בתמונה ב-Google Drive';
    driveLink.className = 'btn btn-outline-primary';
    linkWrap.appendChild(driveLink);
    container.appendChild(linkWrap);
  }

  /**
   * Show error message when all methods fail
   */
  private showErrorMessage(imgElement: HTMLImageElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const container = imgElement.parentElement;
    if (!container || container.querySelector('.image-error-message')) return;

    const errorMsg = document.createElement('div');
    errorMsg.className = 'image-error-message';
    errorMsg.style.cssText = 'padding: 2rem; text-align: center; color: #6b7280; background: #f8f9fa; border-radius: 8px; margin-top: 1rem;';
    errorMsg.innerHTML = `
      <i class="bi bi-exclamation-triangle" style="font-size: 2rem; display: block; margin-bottom: 0.5rem; color: #dc2626; opacity: 0.7;"></i>
      <p style="margin: 0; font-weight: 600; color: #1f2937;">התמונה לא נטענה</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">אנא ודאי שהקובץ ב-Google Drive משותף עם "כל אחד עם הקישור"</p>
    `;
    container.appendChild(errorMsg);
  }

  /**
   * Convert description text to safe HTML, preserving newlines and allowing HTML tags
   */
  getDescriptionHtml(description: string | null | undefined): SafeHtml {
    if (!description) return this.sanitizer.bypassSecurityTrustHtml('');
    
    // Convert \n to <br> tags for line breaks
    let html = description
      .replace(/\r\n/g, '<br>') // Windows line breaks first
      .replace(/\n/g, '<br>')   // Unix line breaks
      .replace(/\r/g, '<br>');  // Old Mac line breaks
    
    // Use bypassSecurityTrustHtml to allow HTML tags (use with caution - only for trusted content)
    // For production, consider using a more restrictive sanitizer
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Calculate event duration in hours (for internal use).
   */
  getEventDuration(): number {
    if (!this.event) return 0;
    const start = new Date(this.event.startDateTime);
    const end = new Date(this.event.endDateTime);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
  }

  /**
   * Formatted duration: "X דקות" when less than 1 hour, otherwise "X שעות".
   */
  getEventDurationText(): string {
    if (!this.event) return '—';
    const start = new Date(this.event.startDateTime);
    const end = new Date(this.event.endDateTime);
    const diffMs = end.getTime() - start.getTime();
    const totalMinutes = Math.round(diffMs / (1000 * 60));
    if (totalMinutes < 60) {
      return `${totalMinutes} דקות`;
    }
    const hours = Math.round((totalMinutes / 60) * 10) / 10;
    return `${hours} שעות`;
  }

  /**
   * Get Hebrew status text
   */
  getStatusText(status: string | null | undefined): string {
    if (!status) return '';
    const statusMap: { [key: string]: string } = {
      'draft': 'טיוטה',
      'published': 'פורסם',
      'closed': 'נסגר'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  /**
   * Check if early bird pricing is still available
   */
  isEarlyBirdAvailable(): boolean {
    if (!this.event?.earlyBirdDeadline) return false;
    const deadline = new Date(this.event.earlyBirdDeadline);
    return deadline > new Date();
  }

  /** Formatted price for display (avoids ICU/pipe parsing issues in template). */
  getFormattedPrice(amount: number): string {
    return amount == null ? '' : new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  }

  /** Whether locationUrl points to an online session (Zoom, Meet, etc.) rather than a map. */
  isLocationUrlOnline(url: string | null | undefined): boolean {
    if (!url || !url.trim()) return false;
    const u = url.trim().toLowerCase();
    return u.includes('zoom') || u.includes('meet.') || u.includes('teams.') || u.includes('webex') || u.includes('gotomeeting');
  }

  /** Icon for location/link: video for online session, geo for physical. */
  getLocationIcon(): string {
    if (this.event?.locationUrl && this.isLocationUrlOnline(this.event.locationUrl)) return 'bi bi-camera-video';
    return 'bi bi-geo-alt';
  }

  /** Label for location field: include "אונליין" when link is to online session. */
  getLocationLabel(): string {
    if (this.event?.locationUrl && this.isLocationUrlOnline(this.event.locationUrl)) return 'מיקום / קישור לאירוע אונליין';
    return 'מיקום';
  }

  /** Link text for locationUrl: "הצטרפו לאירוע" for online, "פתח במפה" for map. */
  getLocationLinkText(): string {
    if (this.event?.locationUrl && this.isLocationUrlOnline(this.event.locationUrl)) return 'הצטרפו לאירוע';
    return 'פתח במפה';
  }

  /** Registration status label for display. */
  getRegistrationStatusLabel(): string {
    return this.event?.registrationOpen ? 'פתוח להרשמה' : 'הרשמה סגורה';
  }

  /** Early bird deadline label for display. */
  getEarlyBirdDeadlineLabel(): string {
    return this.isEarlyBirdAvailable() ? 'זמין עד' : 'פג תוקף';
  }

  /** Formatted registration deadline (avoids ICU parsing of date format in template). */
  getFormattedRegistrationDeadline(): string {
    if (!this.event?.registrationDeadline) return '';
    const d = new Date(this.event.registrationDeadline);
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  private isAllowedToManageEvents(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role || '').toLowerCase();
    return role === 'admin' || role === 'instructor' || role === 'teacher';
  }

  private isAdmin(userInfo: UserInfo | null): boolean {
    return (userInfo?.role || '').toLowerCase() === 'admin';
  }

  private computeCanEditEvent(event: Event): void {
    if (!this.userInfo) return;
    if (this.isAdmin(this.userInfo)) {
      this.canEditEvent = true;
      return;
    }
    const role = (this.userInfo.role || '').toLowerCase();
    if (role !== 'instructor' && role !== 'teacher') return;
    if (event.instructorId == null) return;
    this.instructorsService.getInstructorById(event.instructorId).subscribe({
      next: (inst) => {
        if (inst.userId === this.userInfo!.userId) this.canEditEvent = true;
      }
    });
  }
}
