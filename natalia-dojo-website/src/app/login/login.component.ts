import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { LoginModalService, LoginModalTab } from '../_services/login-modal.service';
import { RegistrationFormComponent } from '../core/templates/registration-form/registration-form.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, RegistrationFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild(RegistrationFormComponent) registrationForm?: RegistrationFormComponent;
  loginForm!: FormGroup;
  isLoginLoading = false;
  errorMessage = '';
  /** True when the current error is 403 email_not_verified (show resend option). */
  isEmailNotVerifiedError = false;
  isResendLoading = false;
  resendMessage = '';
  resendMessageIsError = false;
  showModal = false;
  /** Login vs Register tab when not authenticated (guest can self-register in modal) */
  activeTab: LoginModalTab = 'login';
  /** Toggle to show login password as plain text */
  showLoginPassword = false;
  /** When true, show login form even if user appears authenticated (reconnect after 401/403) */
  isReconnectMode = false;
  private modalSubscription?: Subscription;
  private tabSubscription?: Subscription;

  constructor(
    @Inject(FormBuilder) private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loginModalService: LoginModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initLoginForm();
  }

  ngOnInit(): void {
    // Check if opened as modal or as page route
    this.modalSubscription = this.loginModalService.isOpen$.subscribe(isOpen => {
      this.showModal = isOpen;
      if (isPlatformBrowser(this.platformId)) {
        if (isOpen) {
          document.body.classList.add('modal-open');
          const username = this.loginModalService.prefillUsername;
          const emailNotVerifiedMsg = this.loginModalService.emailNotVerifiedMessage;
          if (emailNotVerifiedMsg) {
            this.errorMessage = emailNotVerifiedMsg;
            this.loginModalService.clearEmailNotVerifiedMessage();
          }
          if (username) {
            this.isReconnectMode = true;
            this.activeTab = 'login';
            this.loginForm.patchValue({ username, password: '' });
            this.loginModalService.clearPrefillUsername();
          } else {
            this.isReconnectMode = false;
            this.activeTab = this.loginModalService.activeTab;
            if (this.activeTab === 'register') {
              setTimeout(() => this.registrationForm?.resetFormState(), 0);
            }
          }
        } else {
          document.body.classList.remove('modal-open');
          this.isReconnectMode = false;
        }
      }
    });

    this.tabSubscription = this.loginModalService.activeTab$.subscribe(tab => {
      if (tab !== this.activeTab) {
        this.setActiveTab(tab);
      }
    });

    // If accessed via route /login, show as modal initially
    if (this.route.snapshot.url.length > 0) {
      this.showModal = true;
      if (isPlatformBrowser(this.platformId)) {
        document.body.classList.add('modal-open');
      }
    }
  }

  ngOnDestroy(): void {
    this.modalSubscription?.unsubscribe();
    this.tabSubscription?.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('modal-open');
    }
  }

  closeModal(): void {
    this.loginModalService.close();
    this.errorMessage = '';
    this.isEmailNotVerifiedError = false;
    this.resendMessage = '';
    this.showLoginPassword = false;
    this.loginForm.reset();
  }

  setActiveTab(tab: LoginModalTab): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.showLoginPassword = false;
    if (tab === 'login') {
      this.loginForm.reset();
    } else {
      setTimeout(() => this.registrationForm?.resetFormState(), 0);
    }
  }

  onSwitchToLoginTab(username: string): void {
    this.activeTab = 'login';
    this.loginForm.patchValue({ username: username || '' });
  }

  /** True when user is not authenticated — show both Login and Register tabs for guest self-registration */
  get showLoginTab(): boolean {
    return !this.authService.isAuthenticated();
  }

  onBackdropClick(event: Event): void {
    // Close modal if clicking on backdrop
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  private initLoginForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoginLoading = true;
    this.errorMessage = '';
    this.isEmailNotVerifiedError = false;
    this.resendMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isLoginLoading = false;
        if (this.isReconnectMode) {
          this.loginModalService.notifyReconnectSuccess();
        }
        this.closeModal();
        // Redirect only if we came from a route, otherwise stay on current page
        if (this.route.snapshot.url.length > 0) {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        this.isLoginLoading = false;
        this.resendMessage = '';
        console.error('Login error:', error);
        // Handle different error scenarios
        if (error.status === 403 && error.error?.code === 'email_not_verified') {
          this.isEmailNotVerifiedError = true;
          this.errorMessage = error.error?.message || 'נא לאמת את כתובת המייל לפני ההתחברות. בדוק את תיבת הדואר או השתמש באפשרות לשלוח שוב.';
        } else if (error.status === 401 || error.status === 400) {
          this.isEmailNotVerifiedError = false;
          this.errorMessage = 'שם משתמש או סיסמה שגויים';
        } else if (error.status === 503) {
          // Service Unavailable: backend up but dependency (e.g. DB) down
          this.errorMessage = 'השירות זמנית לא זמין. אנא נסי שוב בעוד רגע.';
        } else if (error.status === 0) {
          // Network error (CORS, connection refused, server unreachable, etc.)
          this.errorMessage = 'שגיאת רשת: לא ניתן להתחבר לשרת. אנא בדקי את החיבור לאינטרנט ונסי שוב.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'שגיאה בהתחברות. אנא נסי שוב.';
        }
        if (error.status !== 403 || error.error?.code !== 'email_not_verified') {
          this.isEmailNotVerifiedError = false;
        }
      }
    });
  }

  onResendVerificationEmail(): void {
    const value = this.loginForm.get('username')?.value;
    const trimmed = value != null ? String(value).trim() : '';
    if (!trimmed) {
      this.resendMessage = 'הזיני שם משתמש כדי לשלוח שוב אימייל אימות.';
      this.resendMessageIsError = true;
      return;
    }
    this.isResendLoading = true;
    this.resendMessage = '';
    this.resendMessageIsError = false;
    this.authService.resendVerificationEmail(trimmed).subscribe({
      next: (res) => {
        this.isResendLoading = false;
        this.resendMessage = res?.message ?? 'נשלח אימייל אימות לכתובת שמתקשרת לחשבון. בדקי את תיבת הדואר.';
        this.resendMessageIsError = false;
      },
      error: (err) => {
        this.isResendLoading = false;
        this.resendMessage = err?.error?.message ?? err?.message ?? 'שליחת אימייל אימות נכשלה. נסי שוב מאוחר יותר.';
        this.resendMessageIsError = true;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
