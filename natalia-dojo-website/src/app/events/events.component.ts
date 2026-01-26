import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '../_services/auth.service';
import { EventsService, Event } from '../_services/events.service';
import { LoginModalService } from '../_services/login-modal.service';
import { EventsHeroComponent } from './events-hero/events-hero.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventsHeroComponent],
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
  createForm: FormGroup;
  isCreating = false;
  enrollingIds = new Set<number>();

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;

  constructor(
    private eventsService: EventsService,
    private authService: AuthService,
    private loginModalService: LoginModalService,
    private fb: FormBuilder
  ) {
    this.createForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      eventType: ['Seminar', [Validators.required]],
      instructorId: [''],
      status: ['published'],
      startDateTime: ['', [Validators.required]],
      endDateTime: ['', [Validators.required]],
      location: [''],
      locationUrl: [''],
      maxAttendees: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      earlyBirdPrice: [''],
      earlyBirdDeadline: [''],
      registrationOpen: [true],
      registrationDeadline: [''],
      imageUrl: [''],
      isPublished: [true]
    });
  }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userInfo = this.authService.getUserInfo();
    this.isAdminOrInstructor = this.isAllowedToManageEvents(this.userInfo);

    this.authSubscription = this.authService.token$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (!token) {
        this.userInfo = null;
        this.isAdminOrInstructor = false;
        this.events = [];
      } else {
        this.loadEvents();
      }
    });

    this.userSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
      this.isAdminOrInstructor = this.isAllowedToManageEvents(userInfo);
    });

    if (this.isAuthenticated) {
      this.loadEvents();
    }
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  openLogin(): void {
    this.loginModalService.open();
  }

  loadEvents(): void {
    if (!this.isAuthenticated) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.eventsService.getEvents({
      includeUnpublished: this.isAdminOrInstructor,
      type: 'Seminar'
    }).subscribe({
      next: (events) => {
        this.events = events || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'שגיאה בטעינת האירועים. נסו שוב מאוחר יותר.';
      }
    });
  }

  submitCreate(): void {
    if (!this.isAdminOrInstructor) {
      return;
    }
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
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
          status: 'published'
        });
        this.loadEvents();
      },
      error: () => {
        this.isCreating = false;
        this.errorMessage = 'שגיאה ביצירת האירוע.';
      }
    });
  }

  enroll(eventId: number): void {
    if (!this.isAuthenticated || !this.userInfo?.userId) {
      this.openLogin();
      this.errorMessage = 'יש להתחבר או להירשם כאורח כדי להירשם לסמינר.';
      return;
    }

    if (this.enrollingIds.has(eventId)) {
      return;
    }

    this.enrollingIds.add(eventId);
    this.errorMessage = '';
    this.successMessage = '';

    this.eventsService.registerForEvent(eventId, {
      userId: this.userInfo.userId,
      notes: null
    }).subscribe({
      next: () => {
        this.enrollingIds.delete(eventId);
        this.successMessage = 'נרשמת בהצלחה לאירוע.';
      },
      error: () => {
        this.enrollingIds.delete(eventId);
        this.errorMessage = 'שגיאה בהרשמה לאירוע.';
      }
    });
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
}
