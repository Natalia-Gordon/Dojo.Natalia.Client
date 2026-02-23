import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { EventsService, Event } from '../../_services/events.service';
import { AuthService, UserInfo } from '../../_services/auth.service';
import { LoginModalService } from '../../_services/login-modal.service';
import { EventDetailHeroComponent } from './event-detail-hero/event-detail-hero.component';
import { EventRegistrationDialogComponent } from '../../core/templates/event-registration-dialog/event-registration-dialog.component';

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
    });
    this.fromEventsManagement = this.route.snapshot.queryParams['from'] === 'admin-events';
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
        this.instructorName = null;
        // Compute image URL only in browser to avoid SSR issues
        if (isPlatformBrowser(this.platformId) && event.imageUrl) {
          this.displayImageUrl = this.getImageUrl(event.imageUrl);
        } else {
          this.displayImageUrl = event.imageUrl || '';
        }
        if (event.instructorId) {
          this.eventsService.getInstructorById(event.instructorId).subscribe({
            next: (instructor) => {
              this.instructorName = instructor.displayName || instructor.username || null;
            },
            error: () => {
              this.instructorName = null;
            }
          });
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
          this.errorMessage = 'השירות זמנית לא זמין. אנא נסה שוב בעוד כמה רגעים.';
        } else if (error.status === 0) {
          // Network error - backend not available
          this.errorMessage = 'לא ניתן להתחבר לשרת. אנא ודא שהשרת פועל ונסה שוב.';
        } else if (error.status === 404) {
          this.errorMessage = 'האירוע לא נמצא.';
        } else if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'אין הרשאה לצפות באירוע זה.';
        } else {
          this.errorMessage = 'שגיאה בטעינת האירוע. אנא נסה שוב מאוחר יותר.';
        }
      }
    });
    } catch (error) {
      // Fallback for any unexpected errors during SSR
      this.isLoading = false;
      this.errorMessage = 'שגיאה בטעינת האירוע. נסו שוב מאוחר יותר.';
    }
  }

  enroll(): void {
    if (!this.event) return;

    if (!this.isAuthenticated || !this.userInfo?.userId) {
      this.authService.clearSessionLocally();
      this.loginModalService.open('login');
      this.errorMessage = 'יש להתחבר או להירשם כאורח כדי להירשם לסמינר.';
      return;
    }

    // Open registration dialog
    this.eventsService.openRegistrationDialog(this.event);
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  /**
   * Convert Google Drive file link to direct image URL
   * Extracts IMAGE_ID from: https://drive.google.com/file/d/IMAGE_ID/view?usp=sharing
   * Tries multiple URL formats for better compatibility
   */
  getImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) return '';
    
    // During SSR, return empty string to avoid issues
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    
    // Clean the URL - remove any extra whitespace
    const cleanUrl = imageUrl.trim();
    
    // Extract IMAGE_ID from Google Drive file link
    // Pattern: https://drive.google.com/file/d/IMAGE_ID/view?usp=sharing
    const driveFileMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveFileMatch) {
      this.imageId = driveFileMatch[1];
      this.imageLoadAttempt = 0;
      // Prefer thumbnail API first (uc?export=view was disabled by Google in 2024)
      const thumbnailUrl = `https://drive.google.com/thumbnail?id=${this.imageId}&sz=w1920`;
      return thumbnailUrl;
    }
    
    // If it's already in a direct format, extract the ID for fallbacks
    const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && cleanUrl.includes('drive.google.com')) {
      this.imageId = idMatch[1];
      this.imageLoadAttempt = 0;
      return `https://drive.google.com/thumbnail?id=${this.imageId}&sz=w1920`;
    }
    if (idMatch) {
      this.imageId = idMatch[1];
      this.imageLoadAttempt = 0;
    }
    
    // For other URLs (including non-Drive), return as is
    return cleanUrl;
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
   * Handle image load error - try alternative Google Drive URL formats
   */
  onImageError(event: ErrorEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const imgElement = event.target as HTMLImageElement;
    if (!imgElement) return;

    const currentSrc = imgElement.src;
    
    // Try alternative formats if we have a file ID
    if (this.imageId && this.imageLoadAttempt < 3) {
      this.imageLoadAttempt++;
      let fallbackUrl = '';
      
      switch (this.imageLoadAttempt) {
        case 1:
          // Try uc?export=view (may be blocked by Google)
          fallbackUrl = `https://drive.google.com/uc?export=view&id=${this.imageId}`;
          break;
        case 2:
          // Try export=download format
          fallbackUrl = `https://drive.google.com/uc?export=download&id=${this.imageId}`;
          break;
        case 3:
          // Last resort: show Drive preview iframe so image is still visible
          this.showDrivePreviewWithLink(imgElement);
          return;
      }
      
      if (fallbackUrl) {
        console.log(`Trying alternative format ${this.imageLoadAttempt}:`, fallbackUrl);
        imgElement.src = fallbackUrl;
        return;
      }
    }
    
    // All attempts failed - show error message with link
    console.error('All image load attempts failed:', currentSrc);
    this.showErrorMessageWithLink(imgElement);
  }

  /**
   * When direct image URLs fail, show Google Drive preview iframe so the image is still visible,
   * plus a link to open in Drive.
   */
  private showDrivePreviewWithLink(imgElement: HTMLImageElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (!this.imageId) {
      this.showErrorMessage(imgElement);
      return;
    }

    const container = imgElement.parentElement;
    if (!container) return;

    imgElement.style.display = 'none';
    if (container.querySelector('.drive-iframe-embed')) return;

    const previewUrl = `https://drive.google.com/file/d/${this.imageId}/preview`;
    const iframeWrap = document.createElement('div');
    iframeWrap.className = 'drive-iframe-embed';
    const iframe = document.createElement('iframe');
    iframe.src = previewUrl;
    iframe.title = 'תצוגה מקדימה של התמונה';
    iframeWrap.appendChild(iframe);
    container.appendChild(iframeWrap);

    const linkWrap = document.createElement('div');
    linkWrap.className = 'drive-image-error';
    linkWrap.style.cssText = 'padding: 0.75rem 0; text-align: center;';
    const driveLink = document.createElement('a');
    driveLink.href = `https://drive.google.com/file/d/${this.imageId}/view`;
    driveLink.target = '_blank';
    driveLink.rel = 'noopener noreferrer';
    driveLink.textContent = 'לצפייה בתמונה ב-Google Drive';
    driveLink.className = 'btn btn-outline-primary btn-sm';
    linkWrap.appendChild(driveLink);
    container.appendChild(linkWrap);
  }

  /**
   * Show error message with link when we have no image ID (non-Drive URL failed).
   */
  private showErrorMessageWithLink(imgElement: HTMLImageElement): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (!this.imageId) {
      this.showErrorMessage(imgElement);
      return;
    }
    this.showDrivePreviewWithLink(imgElement);
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
      <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">אנא ודא שהקובץ ב-Google Drive משותף עם "כל אחד עם הקישור"</p>
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
   * Calculate event duration in hours
   */
  getEventDuration(): number {
    if (!this.event) return 0;
    const start = new Date(this.event.startDateTime);
    const end = new Date(this.event.endDateTime);
    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60) * 10) / 10; // Round to 1 decimal
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
    return role === 'admin' || role === 'instructor';
  }
}
