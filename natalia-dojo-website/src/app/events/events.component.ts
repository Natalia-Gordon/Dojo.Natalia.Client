import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '../_services/auth.service';
import { EventsService, Event, Instructor } from '../_services/events.service';
import { EventsHeroComponent } from './events-hero/events-hero.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EventsHeroComponent],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css'
})
export class EventsComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  instructors: Instructor[] = [];
  isLoading = false;
  isLoadingInstructors = false;
  errorMessage = '';
  successMessage = '';
  isAuthenticated = false;
  isAdminOrInstructor = false;
  userInfo: UserInfo | null = null;
  createForm: FormGroup;
  isCreating = false;

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private eventsService: EventsService,
    private authService: AuthService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const now = new Date();
    const nowLocal = this.toLocalDateTime(now);
    const todayLocal = this.toLocalDate(now);
    this.createForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      eventType: ['Seminar', [Validators.required]],
      instructorId: [''],
      status: ['published'],
      startDateTime: [nowLocal, [Validators.required]],
      endDateTime: [nowLocal, [Validators.required]],
      location: [''],
      locationUrl: [''],
      maxAttendees: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      earlyBirdPrice: [''],
      earlyBirdDeadline: [todayLocal],
      registrationOpen: [true],
      registrationDeadline: [nowLocal],
      imageUrl: [''],
      isPublished: [true]
    });
  }

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

    // Load instructors if user is admin or instructor
    if (this.isAdminOrInstructor) {
      this.loadInstructors();
    }

    this.authSubscription = this.authService.token$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (!token) {
        this.userInfo = null;
        this.isAdminOrInstructor = false;
      }
      // Reload events when authentication state changes (to show unpublished if admin)
      this.loadEvents();
      // Load instructors if user is admin or instructor
      if (this.isAdminOrInstructor) {
        this.loadInstructors();
      }
    });

    this.userSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
      this.isAdminOrInstructor = this.isAllowedToManageEvents(userInfo);
      // Reload events when user info changes (to show unpublished if admin/instructor)
      this.loadEvents();
      // Load instructors if user is admin or instructor
      if (this.isAdminOrInstructor) {
        this.loadInstructors();
      }
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

  loadInstructors(): void {
    // Only make API calls in browser, not during SSR/prerendering
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoadingInstructors = true;
    try {
      this.eventsService.getInstructors(false).subscribe({
        next: (instructors) => {
          this.instructors = instructors || [];
          this.isLoadingInstructors = false;
        },
        error: () => {
          this.isLoadingInstructors = false;
          this.instructors = [];
        }
      });
    } catch (error) {
      // Fallback for any unexpected errors during SSR
      this.isLoadingInstructors = false;
      this.instructors = [];
    }
  }

  submitCreate(): void {
    if (!this.isAdminOrInstructor) {
      return;
    }
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      this.errorMessage = 'אנא מלא את כל השדות הנדרשים.';
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          const firstInvalid = document.querySelector('.seminar-form .is-invalid');
          if (firstInvalid) {
            (firstInvalid as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
            (firstInvalid as HTMLElement).focus();
          }
        }, 100);
      }
      return;
    }

    this.isCreating = true;
    this.errorMessage = '';
    this.successMessage = '';

    const raw = this.createForm.value;
    const isPublished = !!raw.isPublished;
    const request = {
      title: raw.title,
      description: raw.description,
      eventType: raw.eventType,
      instructorId: raw.instructorId ? Number(raw.instructorId) : null,
      status: isPublished ? 'published' : 'draft',
      startDateTime: this.toIsoDateTime(raw.startDateTime),
      endDateTime: this.toIsoDateTime(raw.endDateTime),
      location: raw.location,
      locationUrl: raw.locationUrl,
      maxAttendees: raw.maxAttendees ? Number(raw.maxAttendees) : null,
      price: Number(raw.price),
      earlyBirdPrice: raw.earlyBirdPrice ? Number(raw.earlyBirdPrice) : null,
      earlyBirdDeadline: raw.earlyBirdDeadline || null,
      registrationOpen: !!raw.registrationOpen,
      registrationDeadline: raw.registrationDeadline || null,
      imageUrl: raw.imageUrl,
      isPublished
    };

    this.eventsService.createEvent(request).subscribe({
      next: () => {
        this.isCreating = false;
        this.successMessage = 'האירוע נוצר בהצלחה.';
        this.createForm.reset({
          eventType: 'Seminar',
          registrationOpen: true,
          isPublished: true,
          price: 0,
          status: 'published',
          startDateTime: this.toLocalDateTime(new Date()),
          endDateTime: this.toLocalDateTime(new Date()),
          earlyBirdDeadline: this.toLocalDate(new Date()),
          registrationDeadline: this.toLocalDateTime(new Date())
        });
        this.loadEvents();
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.isCreating = false;
        this.errorMessage = error.error?.message || 'שגיאה ביצירת האירוע. אנא נסה שוב.';
      }
    });
  }

  openGoogleMapsIfEmpty(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const url = this.createForm.get('locationUrl')?.value;
    if (!url) {
      window.open('https://maps.google.com', '_blank');
    }
  }

  trackByEventId(index: number, eventItem: Event): number {
    return eventItem.id;
  }

  private isAllowedToManageEvents(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role || '').toLowerCase();
    return role === 'admin' || role === 'instructor';
  }

  private toIsoDateTime(value: string): string {
    if (!value) {
      return value;
    }
    const date = new Date(value);
    return date.toISOString();
  }

  private toLocalDateTime(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toLocalDate(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}-${month}-${day}`;
  }
}
