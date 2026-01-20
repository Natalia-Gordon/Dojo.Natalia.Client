import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  isLoading = false;
  errorMessage = '';
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
    this.loginForm.reset();
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
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.closeModal();
        // Redirect only if we came from a route, otherwise stay on current page
        if (this.route.snapshot.url.length > 0) {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        this.isLoading = false;
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  setActiveTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.loginForm.reset();
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
