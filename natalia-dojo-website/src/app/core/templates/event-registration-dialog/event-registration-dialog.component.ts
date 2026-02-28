import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EventsService, Event as EventModel, PaymentMethod, EventRegistrationResponse } from '../../../_services/events.service';
import { InstructorsService, Instructor, InstructorPaymentMethodDto } from '../../../_services/instructors.service';
import { AuthService, UserInfo } from '../../../_services/auth.service';
import { LoginModalService } from '../../../_services/login-modal.service';

@Component({
  selector: 'app-event-registration-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-registration-dialog.component.html',
  styleUrl: './event-registration-dialog.component.css'
})
export class EventRegistrationDialogComponent implements OnInit, OnDestroy {
  showDialog = false;
  event: EventModel | null = null;
  userInfo: UserInfo | null = null;
  selectedPaymentMethod: PaymentMethod | null = null;
  paymentProofFile: File | null = null;
  paymentProofFileName: string = '';
  userNotes: string = '';
  isEnrolling = false;
  errorMessage = '';
  registrationResult: EventRegistrationResponse | null = null;
  instructor: Instructor | null = null;
  isLoadingInstructor = false;
  /** Set when loadInstructor fails (e.g. 401). Used to show re-login message instead of generic "no bank details". */
  instructorLoadErrorStatus: number | null = null;

  paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'מזומן' },
    { value: 'bank_transfer', label: 'העברה בנקאית' },
    { value: 'bit', label: 'העברה ביט' }
  ];

  /** First/default bank method from instructor.paymentMethods for display; fallback to top-level fields. */
  get defaultBankMethod(): InstructorPaymentMethodDto | null {
    if (!this.instructor?.paymentMethods?.length) return null;
    const def = this.instructor.paymentMethods.find(m => m.paymentType === 'bank_transfer' && m.isDefault);
    return def || this.instructor.paymentMethods.find(m => m.paymentType === 'bank_transfer') || null;
  }

  /** First/default Bit method from instructor.paymentMethods. */
  get defaultBitMethod(): InstructorPaymentMethodDto | null {
    if (!this.instructor?.paymentMethods?.length) return null;
    const def = this.instructor.paymentMethods.find(m => m.paymentType === 'bit' && m.isDefault);
    return def || this.instructor.paymentMethods.find(m => m.paymentType === 'bit') || null;
  }

  /** True when Bit is selected and we have a Bit phone number to display. */
  get showBitDetails(): boolean {
    return this.selectedPaymentMethod === 'bit' && !!this.defaultBitMethod?.phoneNumber;
  }

  private subscription?: Subscription;

  constructor(
    private eventsService: EventsService,
    private instructorsService: InstructorsService,
    private authService: AuthService,
    private loginModalService: LoginModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.subscription = this.eventsService.registrationDialogState$.subscribe(state => {
      this.showDialog = state.isOpen;
      this.event = state.event;
      this.userInfo = this.authService.getUserInfo();

      if (isPlatformBrowser(this.platformId)) {
        if (state.isOpen) {
          document.body.classList.add('modal-open');
          // Reset form when opening - set cash as default
          this.selectedPaymentMethod = 'cash';
          this.paymentProofFile = null;
          this.paymentProofFileName = '';
          this.userNotes = '';
          this.errorMessage = '';
          this.registrationResult = null;
          this.instructor = null;
          this.instructorLoadErrorStatus = null;

          // Load instructor details if event has instructorId
          if (state.event?.instructorId) {
            this.loadInstructor(state.event.instructorId);
          }
        } else {
          document.body.classList.remove('modal-open');
        }
      }
    });
  }

  /**
   * Load instructor details by ID
   */
  loadInstructor(instructorId: number): void {
    this.isLoadingInstructor = true;
    this.instructorLoadErrorStatus = null;
    this.instructorsService.getInstructorById(instructorId).subscribe({
      next: (instructor) => {
        this.instructor = instructor;
        this.instructorLoadErrorStatus = null;
        this.isLoadingInstructor = false;
        this.buildPaymentMethodsOptions();
      },
      error: (error) => {
        // Only log non-network and non-404 errors
        if (error.status !== 0 && error.status !== 404) {
          console.error('Error loading instructor:', error);
        }
        this.instructor = null;
        this.instructorLoadErrorStatus = error?.status ?? null;
        this.isLoadingInstructor = false;
      }
    });
  }

  /** Build payment method dropdown from instructor.paymentMethods (Bit + bank transfer) plus cash. */
  private buildPaymentMethodsOptions(): void {
    const options: { value: PaymentMethod; label: string }[] = [{ value: 'cash', label: 'מזומן' }];
    if (this.instructor?.paymentMethods?.length) {
      const hasBit = this.instructor.paymentMethods.some(m => m.paymentType === 'bit');
      const hasBank = this.instructor.paymentMethods.some(m => m.paymentType === 'bank_transfer') || this.hasLegacyBankFields();
      if (hasBit) options.push({ value: 'bit', label: 'ביט (Bit)' });
      if (hasBank) options.push({ value: 'bank_transfer', label: 'העברה בנקאית' });
    } else {
      options.push({ value: 'bank_transfer', label: 'העברה בנקאית' });
    }
    this.paymentMethods = options;
  }

  private hasLegacyBankFields(): boolean {
    const i = this.instructor;
    if (!i) return false;
    return !!(i.bankName || i.accountHolderName || i.accountNumber || i.iban || i.swiftBic || i.bankAddress || i.bankNumber || i.branchName || i.branchNumber);
  }

  /**
   * True when instructor has at least one payment method requiring details (bank or Bit).
   * Uses paymentMethods first, then top-level bank fields.
   */
  hasInstructorBankDetails(): boolean {
    if (!this.instructor) return false;
    if (this.instructor.paymentMethods?.length) {
      return this.instructor.paymentMethods.some(m =>
        (m.paymentType === 'bank_transfer' && (m.bankName || m.accountHolderName || m.accountNumber || m.iban || m.bankNumber || m.branchName)) ||
        (m.paymentType === 'bit' && m.phoneNumber)
      );
    }
    const i = this.instructor;
    return !!(i.bankName || i.accountHolderName || i.accountNumber || i.iban || i.swiftBic || i.bankAddress || i.bankNumber || i.branchName || i.branchNumber);
  }

  /** True when instructor has bank transfer details (for requiring proof when bank_transfer is selected). */
  private hasInstructorBankTransferDetails(): boolean {
    if (!this.instructor) return false;
    if (this.defaultBankMethod) return true;
    return this.hasLegacyBankFields();
  }

  /** True when selected method is bank_transfer and instructor has bank details, or Bit and instructor has Bit phone (proof file required). */
  requiresPaymentProof(): boolean {
    if (this.selectedPaymentMethod === 'bank_transfer') {
      return this.hasInstructorBankTransferDetails();
    }
    if (this.selectedPaymentMethod === 'bit') {
      return !!this.defaultBitMethod?.phoneNumber;
    }
    return false;
  }

  /** True when submit should be disabled: missing payment method, or (bank transfer or Bit) without proof file when required. */
  isEnrollDisabled(): boolean {
    if (this.isEnrolling) return true;
    if (!this.event) return true;
    if (this.event.price > 0 && !this.selectedPaymentMethod) return true;
    if (this.requiresPaymentProof() && !this.paymentProofFile) return true;
    return false;
  }

  /** Log out (clear session) then close registration dialog and show login popup on the same page (e.g. after 401 on instructor load). */
  goToLogin(): void {
    this.authService.clearSessionLocally();
    this.eventsService.closeRegistrationDialog();
    this.loginModalService.open('login');
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('modal-open');
    }
  }

  close(): void {
    this.eventsService.closeRegistrationDialog();
  }

  enroll(): void {
    if (!this.event || !this.userInfo?.userId) {
      this.errorMessage = 'שגיאה: אין מידע מספיק להרשמה.';
      return;
    }

    // Validate payment method for paid events (required)
    if (this.event.price > 0 && !this.selectedPaymentMethod) {
      this.errorMessage = 'אנא בחר סוג תשלום. שדה זה חובה.';
      return;
    }

    // Validate payment proof file when required (bank transfer or Bit with details)
    if (this.requiresPaymentProof() && !this.paymentProofFile) {
      this.errorMessage = 'יש לצרף קובץ להוכחת תשלום.';
      return;
    }

    if (this.isEnrolling) {
      return;
    }

    this.isEnrolling = true;
    this.errorMessage = '';
    this.registrationResult = null;

    this.eventsService.registerForEvent(this.event.id, {
      userId: this.userInfo.userId,
      notes: this.userNotes.trim() || null,
      paymentMethod: this.event.price > 0 ? this.selectedPaymentMethod : null
    }, this.paymentProofFile || null).subscribe({
      next: (response: EventRegistrationResponse) => {
        this.isEnrolling = false;
        this.registrationResult = response;
      },
      error: (error) => {
        this.isEnrolling = false;

        // Only log non-network and non-503 errors to reduce console noise
        if (error.status !== 0 && error.status !== 503) {
          console.error('Error enrolling for event:', error);
        }

        if (error.status === 503) {
          // Service Unavailable - database connection issues
          this.errorMessage = 'השירות זמנית לא זמין. אנא נסה שוב בעוד כמה רגעים.';
        } else if (error.status === 0) {
          this.errorMessage = 'לא ניתן להתחבר לשרת. אנא ודא שהשרת פועל ונסה שוב.';
        } else if (error.status === 404) {
          this.errorMessage = 'האירוע לא נמצא או שההרשמה לא זמינה.';
        } else if (error.status === 401) {
          this.errorMessage = 'יש להתחבר או להירשם כדי להירשם לאירוע.';
        } else if (error.status === 409) {
          this.errorMessage = 'את/ה כבר רשום/ה לאירוע זה.';
        } else {
          this.errorMessage = error.error?.message || 'שגיאה בהרשמה לאירוע. ייתכן שכבר נרשמת או שההרשמה נסגרה.';
        }
      }
    });
  }

  getPaymentStatusText(status: string | null): string {
    if (!status) return '';
    const statusMap: { [key: string]: string } = {
      'free': 'חינם',
      'pending': 'ממתין לאישור',
      'paid': 'שולם',
      'refunded': 'הוחזר',
      'cancelled': 'בוטל'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  getPaymentMethodText(method: string | null): string {
    if (!method) return '';
    const methodObj = this.paymentMethods.find(m => m.value === method);
    return methodObj?.label || method;
  }

  /** Hebrew message for registration result (API sends in background; message reflects pending/success). */
  getRegistrationMessage(result: EventRegistrationResponse): string {
    if (result.message) {
      const m = result.message.toLowerCase();
      if (m.includes('pending') && m.includes('payment')) return 'ההרשמה ממתינה לאישור תשלום. תקבל/י אימייל אישור לאחר שאישור התשלום יטופל.';
      if (m.includes('confirmation') && m.includes('approved')) return 'תקבל/י אימייל אישור לאחר שאישור התשלום יטופל.';
    }
    if (result.paymentStatus === 'pending') return 'ההרשמה ממתינה לאישור תשלום. תקבל/י אימייל אישור לאחר שאישור התשלום יטופל.';
    return 'נרשמת בהצלחה. תקבל/י אימייל אישור בהתאם להגדרות האירוע.';
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
   * Check if early bird pricing is still available
   */
  isEarlyBirdAvailable(): boolean {
    if (!this.event?.earlyBirdDeadline) return false;
    const deadline = new Date(this.event.earlyBirdDeadline);
    return deadline > new Date();
  }

  onPaymentMethodChange(): void {
    this.removeFile();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.paymentProofFile = input.files[0];
      this.paymentProofFileName = this.paymentProofFile.name;
    }
  }

  removeFile(): void {
    this.paymentProofFile = null;
    this.paymentProofFileName = '';
    if (isPlatformBrowser(this.platformId)) {
      const input = document.getElementById('paymentProofFile') as HTMLInputElement;
      if (input) input.value = '';
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isEnrolling && !this.registrationResult) {
      this.close();
    }
  }
}
