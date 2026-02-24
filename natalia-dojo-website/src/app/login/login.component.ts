import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { LoginModalService, LoginModalTab } from '../_services/login-modal.service';
import { RegistrationFormComponent } from '../core/templates/registration-form/registration-form.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RegistrationFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild(RegistrationFormComponent) registrationForm?: RegistrationFormComponent;
  loginForm!: FormGroup;
  isLoginLoading = false;
  errorMessage = '';
  activeTab: 'login' | 'register' = 'login';
  showModal = false;
  /** When true, show login form even if user appears authenticated (reconnect after 401/403) */
  isReconnectMode = false;
  /** User to edit when opening register tab from user management */
  userToEditForForm: { id: number; username?: string | null; email?: string | null; firstName?: string | null; lastName?: string | null; displayName?: string | null; phone?: string | null; dateOfBirth?: string | null; role?: string | null; currentRankId?: number | null; profileImageUrl?: string | null; bio?: string | null; isActive?: boolean } | null = null;
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
          if (username) {
            this.isReconnectMode = true;
            this.activeTab = 'login';
            this.loginForm.patchValue({ username, password: '' });
            this.loginModalService.clearPrefillUsername();
          } else {
            this.isReconnectMode = false;
            this.userToEditForForm = this.loginModalService.userToEdit;
            if (this.userToEditForForm) {
              this.activeTab = 'register';
            }
            // Reset or populate registration form when modal opens on register tab
            if (this.activeTab === 'register' || this.userToEditForForm) {
              if (this.userToEditForForm) {
                setTimeout(() => this.registrationForm?.setUserToEdit(this.userToEditForForm), 0);
              } else {
                setTimeout(() => this.registrationForm?.resetFormState(), 0);
              }
            }
          }
        } else {
          document.body.classList.remove('modal-open');
          this.isReconnectMode = false;
          this.userToEditForForm = null;
          this.loginModalService.clearUserToEdit();
        }
      }
    });

    this.tabSubscription = this.loginModalService.activeTab$.subscribe(tab => {
      if (tab !== this.activeTab) {
        this.setActiveTab(tab);
      }
    });

    // If accessed via route, show as modal initially
    if (this.route.snapshot.url.length > 0) {
      this.showModal = true;
      if (isPlatformBrowser(this.platformId)) {
        document.body.classList.add('modal-open');
      }
    }

    if (!this.showLoginTab) {
      this.activeTab = 'register';
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
    this.loginForm.reset();
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
        console.error('Login error:', error);
        
        // Handle different error scenarios
        if (error.status === 401 || error.status === 400) {
          this.errorMessage = 'שם משתמש או סיסמה שגויים';
        } else if (error.status === 503) {
          // Service Unavailable: backend up but dependency (e.g. DB) down
          this.errorMessage = 'השירות זמנית לא זמין (ייתכן שמסד הנתונים לא מחובר). נסה שוב בעוד רגע.';
        } else if (error.status === 0) {
          // Network error (CORS, connection refused, server unreachable, etc.)
          this.errorMessage = 'שגיאת רשת: לא ניתן להתחבר לשרת. אנא בדוק את החיבור לאינטרנט ונסה שוב.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'שגיאה בהתחברות. אנא נסה שוב.';
        }
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  setActiveTab(tab: LoginModalTab): void {
    this.activeTab = tab;
    this.errorMessage = '';
    if (tab === 'login') {
      this.loginForm.reset();
    }
  }

  onSwitchToLoginTab(username: string): void {
    this.activeTab = 'login';
    this.loginForm.patchValue({ username: username || '' });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get showLoginTab(): boolean {
    return !this.authService.isAuthenticated();
  }

}
