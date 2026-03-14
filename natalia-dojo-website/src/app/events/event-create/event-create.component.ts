import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '../../_services/auth.service';
import { EventsService, Event } from '../../_services/events.service';
import { InstructorsService, Instructor } from '../../_services/instructors.service';
import { EventCreateHeroComponent } from './event-create-hero/event-create-hero.component';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, EventCreateHeroComponent],
  templateUrl: './event-create.component.html',
  styleUrl: './event-create.component.css'
})
export class EventCreateComponent implements OnInit, OnDestroy {
  instructors: Instructor[] = [];
  /** When instructor is logged in, only this instructor is loaded (via GET /api/instructors/me). */
  currentInstructor: Instructor | null = null;
  isLoadingInstructors = false;
  isLoadingEvent = false;
  errorMessage = '';
  successMessage = '';
  isAdminOrInstructor = false;
  isAdmin = false;
  userInfo: UserInfo | null = null;
  createForm: FormGroup;
  isCreating = false;
  /** When set, form is in edit mode for this event id. */
  editEventId: number | null = null;
  /** Event's instructorId at load — instructors cannot change it on update. */
  originalInstructorId: number | null = null;

  private userSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private eventsService: EventsService,
    private instructorsService: InstructorsService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
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

  get isEditMode(): boolean {
    return this.editEventId != null;
  }

  /** Instructor can only create/edit events for themselves; מדריך dropdown stays disabled. Admin can choose. */
  get instructorIdLocked(): boolean {
    return !this.isAdmin;
  }

  /** True when מחיר הרשמה מוקדמת has a value — show תאריך יעד להרשמה מוקדמת only then. */
  get showEarlyBirdDeadline(): boolean {
    const v = this.createForm.get('earlyBirdPrice')?.value;
    if (v == null || v === '') return false;
    const n = Number(v);
    return !Number.isNaN(n) && n > 0;
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.userInfo = this.authService.getUserInfo();
    this.isAdminOrInstructor = this.isAllowedToManageEvents(this.userInfo);
    this.isAdmin = this.isAdminUser(this.userInfo);

    if (!this.isAdminOrInstructor) {
      this.router.navigate(['/events']);
      return;
    }

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const eventIdParam = params.get('eventId');
      const parsed = eventIdParam ? parseInt(eventIdParam, 10) : NaN;
      if (!Number.isNaN(parsed) && parsed > 0) {
        this.editEventId = parsed;
        this.loadEventForEdit(parsed);
      } else {
        this.editEventId = null;
        this.originalInstructorId = null;
        if (this.instructorIdLocked) {
          this.createForm.get('instructorId')?.disable({ emitEvent: false });
        } else {
          this.createForm.get('instructorId')?.enable({ emitEvent: false });
        }
        this.loadInstructors();
      }
    });

    if (!this.editEventId) {
      this.loadInstructors();
    }

    this.userSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
      this.isAdminOrInstructor = this.isAllowedToManageEvents(userInfo);
      this.isAdmin = this.isAdminUser(userInfo);
      if (!this.isAdminOrInstructor) {
        this.router.navigate(['/events']);
        return;
      }
      if (!this.editEventId) {
        this.loadInstructors();
      }
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  /**
   * Load event for edit; allow admin always, or instructor only if they are the event's instructor.
   */
  private loadEventForEdit(eventId: number): void {
    this.isLoadingEvent = true;
    this.errorMessage = '';
    this.eventsService.getEventById(eventId, true).subscribe({
      next: (event) => {
        if (this.isAdminUser(this.userInfo)) {
          this.patchFormFromEvent(event);
          this.loadInstructors();
          this.isLoadingEvent = false;
          return;
        }
        if (event.instructorId == null || !this.userInfo) {
          this.isLoadingEvent = false;
          this.router.navigate(['/events', eventId]);
          return;
        }
        this.instructorsService.getInstructorById(event.instructorId).subscribe({
          next: (inst) => {
            if (inst.userId !== this.userInfo!.userId) {
              this.router.navigate(['/events', eventId]);
              this.isLoadingEvent = false;
              return;
            }
            this.currentInstructor = inst;
            this.patchFormFromEvent(event);
            this.isLoadingEvent = false;
          },
          error: () => {
            this.isLoadingEvent = false;
            this.router.navigate(['/events', eventId]);
          }
        });
      },
      error: () => {
        this.isLoadingEvent = false;
        this.errorMessage = 'לא ניתן לטעון את האירוע לעריכה.';
        this.router.navigate(['/events']);
      }
    });
  }

  /** Map API eventType to exact option value used by the סוג אירוע select. */
  private normalizeEventTypeForForm(apiEventType: string | null | undefined): string {
    const raw = (apiEventType ?? '').trim();
    const rawLower = raw.toLowerCase().replace(/\s+/g, '_');
    if (!rawLower) return 'Seminar';
    const mapping: Record<string, string> = {
      seminar: 'Seminar',
      workshop: 'Workshop',
      masterclass: 'Masterclass',
      grading: 'Grading',
      retreat: 'retreat',
      zen_session: 'zen_session',
      zen: 'zen_session',
      special: 'Special',
      special_training: 'Special',
      social: 'Seminar',
      online_session: 'Seminar',
    };
    const exact = mapping[rawLower];
    if (exact) return exact;
    if (['Seminar', 'Workshop', 'Masterclass', 'Grading', 'Special'].includes(raw)) return raw;
    if (raw === 'retreat' || raw === 'zen_session') return raw;
    return 'Seminar';
  }

  private patchFormFromEvent(event: Event): void {
    const start = event.startDateTime ? this.toLocalDateTime(new Date(event.startDateTime)) : this.toLocalDateTime(new Date());
    const end = event.endDateTime ? this.toLocalDateTime(new Date(event.endDateTime)) : start;
    const regDeadline = event.registrationDeadline
      ? this.toLocalDateTime(new Date(event.registrationDeadline))
      : end;
    const earlyBirdDeadline = event.earlyBirdDeadline
      ? this.toLocalDate(new Date(event.earlyBirdDeadline))
      : this.toLocalDate(new Date());
    const eventType = this.normalizeEventTypeForForm(event.eventType ?? null);
    this.originalInstructorId = event.instructorId ?? null;
    this.createForm.patchValue({
      title: event.title || '',
      description: event.description || '',
      eventType: eventType,
      instructorId: event.instructorId ?? '',
      status: event.status || 'published',
      startDateTime: start,
      endDateTime: end,
      location: event.location || '',
      locationUrl: event.locationUrl || '',
      maxAttendees: event.maxAttendees ?? '',
      price: event.price ?? 0,
      earlyBirdPrice: event.earlyBirdPrice ?? '',
      earlyBirdDeadline: earlyBirdDeadline,
      registrationOpen: !!event.registrationOpen,
      registrationDeadline: regDeadline,
      imageUrl: event.imageUrl || '',
      isPublished: !!event.isPublished
    });
    if (this.instructorIdLocked) {
      this.createForm.get('instructorId')?.disable({ emitEvent: false });
    } else {
      this.createForm.get('instructorId')?.enable({ emitEvent: false });
    }
  }

  loadInstructors(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isLoadingInstructors = true;
    this.currentInstructor = null;

    if (this.instructorIdLocked) {
      // Instructor: load only current instructor via GET /api/instructors/me (one call); fallback to full list if /me not implemented
      this.instructorsService.getCurrentInstructor().subscribe({
        next: (instructor) => {
          this.currentInstructor = instructor;
          this.createForm.patchValue({ instructorId: String(instructor.instructorId) }, { emitEvent: false });
          this.createForm.get('instructorId')?.disable({ emitEvent: false });
          this.isLoadingInstructors = false;
        },
        error: () => {
          this.instructorsService.getInstructors(false).subscribe({
            next: (instructors) => {
              const list = instructors || [];
              const me = this.userInfo && list.find(i => i.userId === this.userInfo!.userId);
              if (me) {
                this.currentInstructor = me;
                this.createForm.patchValue({ instructorId: String(me.instructorId) }, { emitEvent: false });
              }
              this.createForm.get('instructorId')?.disable({ emitEvent: false });
              this.isLoadingInstructors = false;
            },
            error: () => {
              this.isLoadingInstructors = false;
              this.currentInstructor = null;
            }
          });
        }
      });
      return;
    }

    // Admin: load full list for dropdown
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

    const raw = this.createForm.getRawValue();
    const isPublished = !!raw.isPublished;
    let instructorId: number | null = raw.instructorId ? Number(raw.instructorId) : null;
    if (this.instructorIdLocked) {
      instructorId = this.editEventId != null ? this.originalInstructorId : instructorId;
    }
    const request = {
      title: raw.title,
      description: raw.description,
      eventType: raw.eventType,
      instructorId,
      status: isPublished ? 'published' : 'draft',
      startDateTime: this.toIsoDateTime(raw.startDateTime),
      endDateTime: this.toIsoDateTime(raw.endDateTime),
      location: raw.location,
      locationUrl: raw.locationUrl,
      maxAttendees: raw.maxAttendees ? Number(raw.maxAttendees) : null,
      price: Number(raw.price),
      earlyBirdPrice: raw.earlyBirdPrice ? Number(raw.earlyBirdPrice) : null,
      earlyBirdDeadline: this.showEarlyBirdDeadline ? (raw.earlyBirdDeadline || null) : null,
      registrationOpen: !!raw.registrationOpen,
      registrationDeadline: raw.registrationDeadline ? this.toIsoDateTime(raw.registrationDeadline) : null,
      imageUrl: raw.imageUrl,
      isPublished
    };

    if (this.editEventId != null) {
      this.eventsService.updateEvent(this.editEventId, request).subscribe({
        next: () => {
          this.isCreating = false;
          this.successMessage = 'האירוע עודכן בהצלחה.';
          setTimeout(() => {
            this.router.navigate(['/events', this.editEventId!]);
          }, 1200);
        },
        error: (error) => {
          this.isCreating = false;
          this.errorMessage = error.error?.message || 'שגיאה בעדכון האירוע. אנא נסי שוב.';
        }
      });
      return;
    }

    this.eventsService.createEvent(request).subscribe({
      next: () => {
        this.isCreating = false;
        this.successMessage = 'האירוע נוצר בהצלחה.';
        const now = new Date();
        const nowLocal = this.toLocalDateTime(now);
        this.createForm.reset({
          eventType: 'Seminar',
          registrationOpen: true,
          isPublished: true,
          price: 0,
          status: 'published',
          startDateTime: nowLocal,
          endDateTime: nowLocal,
          earlyBirdDeadline: this.toLocalDate(now),
          registrationDeadline: nowLocal
        });
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.isCreating = false;
        this.errorMessage = error.error?.message || 'שגיאה ביצירת האירוע. אנא נסי שוב.';
      }
    });
  }

  /** Open the location URL in a new tab, or Google Maps if the field is empty. */
  openLocationLink(event: MouseEvent): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;
    const url = (this.createForm.get('locationUrl')?.value || '').trim();
    window.open(url || 'https://maps.google.com', '_blank');
  }

  private isAllowedToManageEvents(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role || '').toLowerCase();
    return role === 'admin' || role === 'instructor' || role === 'teacher';
  }

  private isAdminUser(userInfo: UserInfo | null): boolean {
    return (userInfo?.role || '').toLowerCase() === 'admin';
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
