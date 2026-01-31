import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { EventsService, Event } from '../../_services/events.service';
import { AuthService, UserInfo } from '../../_services/auth.service';
import { LoginModalService } from '../../_services/login-modal.service';
import { EventsHeroComponent } from '../events-hero/events-hero.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EventsHeroComponent],
  templateUrl: './event-detail.component.html',
  styleUrl: './event-detail.component.css'
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isAuthenticated = false;
  userInfo: UserInfo | null = null;
  isEnrolling = false;

  private routeSubscription?: Subscription;
  private authSubscription?: Subscription;
  private userInfoSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService,
    private authService: AuthService,
    private loginModalService: LoginModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userInfo = this.authService.getUserInfo();

    this.authSubscription = this.authService.token$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (!token) {
        this.userInfo = null;
      }
    });

    this.userInfoSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
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

    this.eventsService.getEventById(eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Failed to load event:', error);
        this.errorMessage = 'שגיאה בטעינת האירוע. אנא נסה שוב מאוחר יותר.';
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

    if (this.isEnrolling) {
      return;
    }

    this.isEnrolling = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.eventsService.registerForEvent(this.event.id, {
      userId: this.userInfo.userId,
      notes: null
    }).subscribe({
      next: () => {
        this.isEnrolling = false;
        this.successMessage = 'נרשמת בהצלחה לאירוע!';
      },
      error: (error) => {
        this.isEnrolling = false;
        console.error('Error enrolling for event:', error);
        this.errorMessage = 'שגיאה בהרשמה לאירוע. ייתכן שכבר נרשמת או שההרשמה נסגרה.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }
}
