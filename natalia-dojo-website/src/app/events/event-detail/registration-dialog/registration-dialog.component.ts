import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EventsService, Event as EventModel, PaymentMethod, EventRegistrationResponse } from '../../../_services/events.service';
import { AuthService, UserInfo } from '../../../_services/auth.service';

@Component({
  selector: 'app-registration-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-dialog.component.html',
  styleUrl: './registration-dialog.component.css'
})
export class RegistrationDialogComponent implements OnInit, OnDestroy {
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
  
  paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'מזומן' },
    { value: 'bank_transfer', label: 'העברה בנקאית' }
  ];

  private subscription?: Subscription;

  constructor(
    private eventsService: EventsService,
    private authService: AuthService,
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
        } else {
          document.body.classList.remove('modal-open');
        }
      }
    });
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
    }).subscribe({
      next: (response: EventRegistrationResponse) => {
        this.isEnrolling = false;
        this.registrationResult = response;
      },
      error: (error) => {
        this.isEnrolling = false;
        
        // Only log non-network errors to reduce console noise
        if (error.status !== 0) {
          console.error('Error enrolling for event:', error);
        }
        
        if (error.status === 0) {
          this.errorMessage = 'לא ניתן להתחבר לשרת. אנא ודא שהשרת פועל ונסה שוב.';
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
    // Reset the file input
    const fileInput = document.getElementById('paymentProofFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isEnrolling && !this.registrationResult) {
      this.close();
    }
  }
}
