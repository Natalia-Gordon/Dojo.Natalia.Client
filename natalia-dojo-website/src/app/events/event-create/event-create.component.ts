import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '../../_services/auth.service';
import { EventsService } from '../../_services/events.service';
import { InstructorsService, Instructor } from '../../_services/instructors.service';
import { EventsHeroComponent } from '../events-hero/events-hero.component';
import { EventCreateHeroComponent } from './event-create-hero/event-create-hero.component';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EventCreateHeroComponent],
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.css'
})
export class EventCreateComponent implements OnInit, OnDestroy {
  instructors: Instructor[] = [];
  isLoadingInstructors = false;
  errorMessage = '';
  successMessage = '';
  isAdminOrInstructor = false;
  userInfo: UserInfo | null = null;
  createForm: FormGroup;
  isCreating = false;

  private userSubscription?: Subscription;

  constructor(
    private eventsService: EventsService,
    private instructorsService: InstructorsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.userInfo = this.authService.getUserInfo();
    this.isAdminOrInstructor = this.isAllowedToManageEvents(this.userInfo);

    if (!this.isAdminOrInstructor) {
      this.router.navigate(['/events']);
      return;
    }

    this.loadInstructors();

    this.userSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
      this.isAdminOrInstructor = this.isAllowedToManageEvents(userInfo);
      if (!this.isAdminOrInstructor) {
        this.router.navigate(['/events']);
        return;
      }
      this.loadInstructors();
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  loadInstructors(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isLoadingInstructors = true;
    try {
      this.instructorsService.getInstructors(false).subscribe({
        next: (instructors) => {
          this.instructors = instructors || [];
          this.isLoadingInstructors = false;
        },
        error: () => {
          this.isLoadingInstructors = false;
          this.instructors = [];
        }
      });
    } catch {
      this.isLoadingInstructors = false;
      this.instructors = [];
    }
  }

  submitCreate(): void {
    if (!this.isAdminOrInstructor) return;

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

  private isAllowedToManageEvents(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role || '').toLowerCase();
    return role === 'admin' || role === 'instructor';
  }

  private toIsoDateTime(value: string): string {
    if (!value) return value;
    return new Date(value).toISOString();
  }

  private toLocalDateTime(date: Date): string {
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private toLocalDate(date: Date): string {
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}
