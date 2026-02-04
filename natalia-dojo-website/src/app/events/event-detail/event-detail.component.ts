import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { EventsService, Event } from '../../_services/events.service';
import { AuthService, UserInfo } from '../../_services/auth.service';
import { LoginModalService } from '../../_services/login-modal.service';
import { EventDetailHeroComponent } from './event-detail-hero/event-detail-hero.component';
import { RegistrationDialogComponent } from './registration-dialog/registration-dialog.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EventDetailHeroComponent, RegistrationDialogComponent],
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

  private routeSubscription?: Subscription;
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
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.userInfoSubscription?.unsubscribe();
  }

  loadEvent(eventId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // If user is admin/instructor, send auth headers to potentially see unpublished events
    const requireAuth = this.isAdminOrInstructor;

    this.eventsService.getEventById(eventId, requireAuth).subscribe({
      next: (event) => {
        this.event = event;
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
  }

  enroll(): void {
    if (!this.event) return;

    if (!this.isAuthenticated || !this.userInfo?.userId) {
      this.loginModalService.open();
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
    
    // Clean the URL - remove any extra whitespace
    const cleanUrl = imageUrl.trim();
    
    // Extract IMAGE_ID from Google Drive file link
    // Pattern: https://drive.google.com/file/d/IMAGE_ID/view?usp=sharing
    const driveFileMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveFileMatch) {
      this.imageId = driveFileMatch[1];
      this.imageLoadAttempt = 0;
      // Convert to direct view URL - this format works best for shared images
      const convertedUrl = `https://drive.google.com/uc?export=view&id=${this.imageId}`;
      return convertedUrl;
    }
    
    // If it's already in a direct format, extract the ID for fallbacks
    const idMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      this.imageId = idMatch[1];
      this.imageLoadAttempt = 0;
    }
    
    // If it's already in the direct format, return as is
    if (cleanUrl.includes('drive.google.com/uc?export=')) {
      return cleanUrl;
    }
    
    // For other URLs (including Google CDN), return as is
    return cleanUrl;
  }

  /**
   * Handle successful image load
   */
  onImageLoad(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement && imgElement.parentElement) {
      imgElement.parentElement.style.display = 'flex';
    }
  }

  /**
   * Handle image load error - try alternative Google Drive URL formats
   */
  onImageError(event: ErrorEvent): void {
    const imgElement = event.target as HTMLImageElement;
    if (!imgElement) return;

    const currentSrc = imgElement.src;
    
    // Try alternative formats if we have a file ID
    if (this.imageId && this.imageLoadAttempt < 3) {
      this.imageLoadAttempt++;
      let fallbackUrl = '';
      
      switch (this.imageLoadAttempt) {
        case 1:
          // Try thumbnail API
          fallbackUrl = `https://drive.google.com/thumbnail?id=${this.imageId}&sz=w1920`;
          break;
        case 2:
          // Try export=download format
          fallbackUrl = `https://drive.google.com/uc?export=download&id=${this.imageId}`;
          break;
        case 3:
          // Last resort: use iframe embed
          this.showIframeEmbed(imgElement);
          return;
      }
      
      if (fallbackUrl) {
        console.log(`Trying alternative format ${this.imageLoadAttempt}:`, fallbackUrl);
        imgElement.src = fallbackUrl;
        return;
      }
    }
    
    // All attempts failed - show iframe embed or error message
    console.error('All image load attempts failed:', currentSrc);
    this.showIframeEmbed(imgElement);
  }

  /**
   * Show Google Drive iframe embed as fallback
   */
  private showIframeEmbed(imgElement: HTMLImageElement): void {
    if (!this.imageId) {
      this.showErrorMessage(imgElement);
      return;
    }

    const container = imgElement.parentElement;
    if (!container) return;

    // Hide the image
    imgElement.style.display = 'none';

    // Check if iframe already exists
    if (container.querySelector('.drive-iframe-embed')) return;

    // Create iframe embed
    const iframeWrapper = document.createElement('div');
    iframeWrapper.className = 'drive-iframe-embed';
    iframeWrapper.style.cssText = 'width: 100%; border-radius: 12px; overflow: hidden;';
    
    const iframe = document.createElement('iframe');
    iframe.src = `https://drive.google.com/file/d/${this.imageId}/preview`;
    iframe.style.cssText = 'width: 100%; min-height: 600px; border: none; border-radius: 12px;';
    iframe.allow = 'fullscreen';
    iframe.title = 'Google Drive Image';
    iframe.loading = 'lazy';
    
    iframeWrapper.appendChild(iframe);
    container.appendChild(iframeWrapper);
  }

  /**
   * Show error message when all methods fail
   */
  private showErrorMessage(imgElement: HTMLImageElement): void {
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

  private isAllowedToManageEvents(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role || '').toLowerCase();
    return role === 'admin' || role === 'instructor';
  }
}
