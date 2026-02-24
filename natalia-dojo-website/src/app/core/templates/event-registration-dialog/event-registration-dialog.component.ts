import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EventsService, Event as EventModel, PaymentMethod, EventRegistrationResponse, Instructor } from '../../../_services/events.service';
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

  private subscription?: Subscription;

  constructor(
    private eventsService: EventsService,
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
    this.eventsService.getInstructorById(instructorId).subscribe({
      next: (instructor) => {
        this.instructor = instructor;
        this.instructorLoadErrorStatus = null;
        this.isLoadingInstructor = false;
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

  /** True when instructor was loaded and has at least one bank detail (for showing payment proof upload). */
  hasInstructorBankDetails(): boolean {
    if (!this.instructor) return false;
    const i = this.instructor;
    return !!(i.bankName || i.accountHolderName || i.accountNumber || i.iban || i.swiftBic || i.bankAddress || i.bankId || i.branchNumber);
  }

  /** True when instructor has phone (for Bit transfer payment proof upload). */
  hasInstructorBitPhone(): boolean {
    return !!(this.instructor?.phone);
  }

  /** True when submit should be disabled: missing payment method, or bank/bit transfer without proof file. */
  isEnrollDisabled(): boolean {
    if (this.isEnrolling) return true;
    if (!this.event) return true;
    if (this.event.price > 0 && !this.selectedPaymentMethod) return true;
    if (this.selectedPaymentMethod === 'bank_transfer' && this.hasInstructorBankDetails() && !this.paymentProofFile) return true;
    if (this.selectedPaymentMethod === 'bit' && this.hasInstructorBitPhone() && !this.paymentProofFile) return true;
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

    // Validate payment proof file when bank transfer is selected and bank details are shown
    if (this.selectedPaymentMethod === 'bank_transfer' && this.hasInstructorBankDetails() && !this.paymentProofFile) {
      this.errorMessage = 'בהעברה בנקאית יש לצרף קובץ להוכחת תשלום.';
      return;
    }

    // Validate payment proof file when Bit transfer is selected and instructor phone is shown
    if (this.selectedPaymentMethod === 'bit' && this.hasInstructorBitPhone() && !this.paymentProofFile) {
      this.errorMessage = 'בהעברת ביט יש לצרף קובץ להוכחת תשלום.';
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
    // Reset the file input (bank transfer and Bit use different ids, only one in DOM at a time)
    if (isPlatformBrowser(this.platformId)) {
      const bankInput = document.getElementById('paymentProofFile') as HTMLInputElement;
      const bitInput = document.getElementById('paymentProofFileBit') as HTMLInputElement;
      if (bankInput) bankInput.value = '';
      if (bitInput) bitInput.value = '';
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isEnrolling && !this.registrationResult) {
      this.close();
    }
  }
}
