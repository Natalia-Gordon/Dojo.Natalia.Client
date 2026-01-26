import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { LoginModalService } from '../_services/login-modal.service';
import { Title, Meta } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginLoading = false;
  isRegisterLoading = false;
  errorMessage = '';
  registerError = '';
  registerSuccess = '';
  activeTab: 'login' | 'register' = 'login';
  showModal = false;
  private modalSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private loginModalService: LoginModalService,
    private title: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    // Check if opened as modal or as page route
    this.modalSubscription = this.loginModalService.isOpen$.subscribe(isOpen => {
      this.showModal = isOpen;
      if (isPlatformBrowser(this.platformId)) {
        if (isOpen) {
          document.body.classList.add('modal-open');
        } else {
          document.body.classList.remove('modal-open');
        }
      }
    });

    // If accessed via route, show as modal initially
    if (this.route.snapshot.url.length > 0) {
      this.showModal = true;
      if (isPlatformBrowser(this.platformId)) {
        document.body.classList.add('modal-open');
      }
    }
  }

  ngOnDestroy(): void {
    this.modalSubscription?.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('modal-open');
    }
  }

  closeModal(): void {
    this.loginModalService.close();
    this.errorMessage = '';
    this.registerError = '';
    this.registerSuccess = '';
    this.loginForm.reset();
    this.registerForm.reset({ userType: 'guest' });
  }

  onBackdropClick(event: Event): void {
    // Close modal if clicking on backdrop
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      userType: ['guest', [Validators.required]],
      firstName: [''],
      lastName: [''],
      displayName: [''],
      phone: [''],
      dateOfBirth: [''],
      profileImageUrl: [''],
      bio: ['']
    }, { validators: [this.passwordsMatchValidator] });
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
        } else if (error.status === 0 || error.error?.message) {
          this.errorMessage = error.error?.message || 'שגיאה בהתחברות. נסה שוב מאוחר יותר.';
        } else {
          this.errorMessage = 'שגיאה בהתחברות. אנא נסה שוב.';
        }
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isRegisterLoading = true;
    this.registerError = '';
    this.registerSuccess = '';

    const {
      confirmPassword,
      ...request
    } = this.registerForm.value;

    this.authService.register(request).subscribe({
      next: () => {
        this.isRegisterLoading = false;
        this.registerSuccess = 'ההרשמה הושלמה. ניתן להתחבר כעת.';
        this.activeTab = 'login';
        this.loginForm.patchValue({
          username: request.username || request.email || ''
        });
        this.registerForm.reset({ userType: 'guest' });
      },
      error: (error) => {
        this.isRegisterLoading = false;
        console.error('Register error:', error);
        if (error.status === 400) {
          this.registerError = error.error?.message || 'פרטי הרשמה אינם תקינים';
        } else {
          this.registerError = 'שגיאה בהרשמה. אנא נסה שוב.';
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

  setActiveTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.registerError = '';
    this.registerSuccess = '';
    this.loginForm.reset();
    this.registerForm.reset({ userType: 'guest' });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get registerPassword() {
    return this.registerForm.get('password');
  }

  get registerConfirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) {
      return null;
    }
    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
