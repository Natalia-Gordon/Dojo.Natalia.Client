import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '../_services/auth.service';
import { EventsService, Event } from '../_services/events.service';
import { EventsHeroComponent } from './events-hero/events-hero.component';

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

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private eventsService: EventsService,
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
        },
        error: (error) => {
          this.isLoading = false;
          // Handle 503 Service Unavailable with specific message
          if (error.status === 503) {
            this.errorMessage = 'השירות זמנית לא זמין. אנא נסה שוב בעוד כמה רגעים.';
          } else if (error.status === 0) {
            // Network error - backend not available
            this.errorMessage = 'לא ניתן להתחבר לשרת. אנא ודא שהשרת פועל ונסה שוב.';
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

  private isAllowedToManageEvents(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role || '').toLowerCase();
    return role === 'admin' || role === 'instructor';
  }
}
