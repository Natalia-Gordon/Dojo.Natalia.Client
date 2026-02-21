import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { Rank, RanksService } from '../_services/ranks.service';
import { LoginModalService, LoginModalTab } from '../_services/login-modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  ranks: Rank[] = [];
  isRanksLoading = false;
  ranksError = '';
  isLoginLoading = false;
  isRegisterLoading = false;
  errorMessage = '';
  registerError = '';
  registerSuccess = '';
  activeTab: 'login' | 'register' = 'login';
  showModal = false;
  private modalSubscription?: Subscription;
  private tabSubscription?: Subscription;
  private userInfoSubscription?: Subscription;
  private userTypeSubscription?: Subscription;
  private registeredUserId: number | null = null;
  private registeredUserSnapshot: Record<string, string | null> | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private ranksService: RanksService,
    private router: Router,
    private route: ActivatedRoute,
    private loginModalService: LoginModalService,
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
          if (this.showRankSelect) {
            this.loadRanks();
          }
        } else {
          document.body.classList.remove('modal-open');
        }
      }
    });

    this.tabSubscription = this.loginModalService.activeTab$.subscribe(tab => {
      if (tab !== this.activeTab) {
        this.setActiveTab(tab);
      }
    });

    this.userInfoSubscription = this.authService.userInfo$.subscribe(() => {
      this.syncUserTypeWithRole();
      this.setUserTypeControlState();
      // Do not load ranks on login (userInfo$ emits after login). Ranks load only when modal opens or user type changes.
      this.ranks = [];
      this.setRankValidators();
    });

    this.userTypeSubscription = this.registerForm.get('userType')?.valueChanges.subscribe(() => {
      this.setRankControlState();
      if (this.showRankSelect && this.showModal) {
        this.loadRanks();
      } else {
        this.ranks = [];
        this.setRankValidators();
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

    // Do not load ranks on init — only when modal is open (see modalSubscription above).
    // This avoids /api/ranks on every page refresh.

    this.updateRegisterControlStates();
  }

  ngOnDestroy(): void {
    this.modalSubscription?.unsubscribe();
    this.tabSubscription?.unsubscribe();
    this.userInfoSubscription?.unsubscribe();
    this.userTypeSubscription?.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('modal-open');
    }
  }

  closeModal(): void {
    this.loginModalService.close();
    this.errorMessage = '';
    this.registerError = '';
    this.registerSuccess = '';
    this.registeredUserId = null;
    this.registeredUserSnapshot = null;
    this.loginForm.reset();
    this.registerForm.reset({ userType: this.getDefaultRegisterUserType(), rankId: null });
    this.setRegisterModeValidators();
    this.updateRegisterControlStates();
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
      userType: [this.getDefaultRegisterUserType(), [Validators.required]],
      rankId: [null],
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

    if (request.rankId !== null && request.rankId !== undefined) {
      request.CurrentRankId = request.rankId;
    }
    delete request.rankId;

    if (typeof request.dateOfBirth === 'string' && request.dateOfBirth.trim() === '') {
      delete request.dateOfBirth;
    }

    const normalizedUserType = String(request.userType || '').trim().toLowerCase();
    if (this.isInstructorConnected) {
      request.userType = 'student';
    } else if (this.isAdminConnected) {
      request.userType = ['guest', 'instructor', 'student'].includes(normalizedUserType)
        ? normalizedUserType
        : this.getDefaultRegisterUserType();
    } else {
      request.userType = 'guest';
    }

    request.CreatorRole = (this.authService.getUserInfo()?.role || '').trim().toLowerCase();

    this.authService.register(request).subscribe({
      next: (createdUser) => {
        this.isRegisterLoading = false;
        const isAuthenticated = this.authService.isAuthenticated();
        const displayName = this.getRegisteredDisplayName(createdUser, request);
        if (isAuthenticated) {
          this.registerSuccess = `הצלחה: ${displayName} נרשם בהצלחה`;
          this.registeredUserId = createdUser?.id ?? null;
          this.setUpdateModeValidators();
          this.registeredUserSnapshot = this.buildRegisterSnapshot(this.registerForm.value);
          this.registerForm.markAsPristine();
          if (this.isAdminConnected) {
            this.authService.notifyUsersRefresh();
          }
          return;
        }
        this.registerSuccess = 'ההרשמה הושלמה. ניתן להתחבר כעת.';
        this.activeTab = 'login';
        this.loginForm.patchValue({
          username: request.username || request.email || ''
        });
        this.registerForm.reset({ userType: this.getDefaultRegisterUserType(), rankId: null });
        this.setRegisterModeValidators();
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

  setActiveTab(tab: LoginModalTab): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.registerError = '';
    this.registerSuccess = '';
    this.registeredUserId = null;
    this.registeredUserSnapshot = null;
    this.loginForm.reset();
    this.registerForm.reset({ userType: this.getDefaultRegisterUserType(), rankId: null });
    this.setRegisterModeValidators();
    this.updateRegisterControlStates();
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

  get showLoginTab(): boolean {
    return !this.authService.isAuthenticated();
  }

  get showConnectedRegistrationSuccess(): boolean {
    return !this.showLoginTab && !!this.registerSuccess;
  }

  get showConnectedRegistrationMessage(): boolean {
    return this.showConnectedRegistrationSuccess && !this.hasRegisterChanges();
  }

  get showConnectedRegistrationUpdateButton(): boolean {
    return this.showConnectedRegistrationSuccess && this.hasRegisterChanges();
  }

  get showRankSelect(): boolean {
    if (this.showLoginTab) {
      return false;
    }
    if (this.isInstructorConnected) {
      return true;
    }
    if (this.isAdminConnected) {
      const userType = String(this.registerForm.get('userType')?.value || '').trim().toLowerCase();
      return userType === 'instructor' || userType === 'student';
    }
    return false;
  }

  get isAdminConnected(): boolean {
    return this.getConnectedRole() === 'admin';
  }

  get isInstructorConnected(): boolean {
    return this.getConnectedRole() === 'instructor';
  }

  onUpdateRegisteredUser(): void {
    if (!this.registeredUserId) {
      return;
    }
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isRegisterLoading = true;
    this.registerError = '';

    const {
      confirmPassword,
      username,
      ...updateRequest
    } = this.registerForm.value;

    if (updateRequest.rankId !== null && updateRequest.rankId !== undefined) {
      updateRequest.currentRankId = updateRequest.rankId;
    }
    delete updateRequest.rankId;

    if (typeof updateRequest.dateOfBirth === 'string' && updateRequest.dateOfBirth.trim() === '') {
      delete updateRequest.dateOfBirth;
    }

    if (!updateRequest.password || String(updateRequest.password).trim() === '') {
      delete updateRequest.password;
    }

    this.authService.updateUser(this.registeredUserId, updateRequest).subscribe({
      next: (updatedUser) => {
        this.isRegisterLoading = false;
        const displayName = this.getRegisteredDisplayName(updatedUser, this.registerForm.value);
        this.registerSuccess = `הצלחה: ${displayName} עודכן בהצלחה`;
        this.registeredUserSnapshot = this.buildRegisterSnapshot(this.registerForm.value);
        this.registerForm.markAsPristine();
      },
      error: (error) => {
        this.isRegisterLoading = false;
        console.error('Update user error:', error);
        this.registerError = 'שגיאה בעדכון משתמש. אנא נסה שוב.';
      }
    });
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password && !confirmPassword) {
      return null;
    }
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private getRegisteredDisplayName(
    createdUser: { displayName: string | null; username: string | null } | null | undefined,
    request: { displayName?: string | null; firstName?: string | null; lastName?: string | null; username?: string | null; email?: string | null }
  ): string {
    const responseDisplayName = (createdUser?.displayName || '').trim();
    if (responseDisplayName) return responseDisplayName;

    const requestDisplayName = (request.displayName || '').trim();
    if (requestDisplayName) return requestDisplayName;

    const fullName = `${request.firstName || ''} ${request.lastName || ''}`.trim();
    if (fullName) return fullName;

    return (createdUser?.username || request.username || request.email || 'משתמש חדש').trim();
  }

  private setUpdateModeValidators(): void {
    const passwordControl = this.registerForm.get('password');
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    passwordControl?.clearValidators();
    confirmPasswordControl?.clearValidators();
    passwordControl?.updateValueAndValidity();
    confirmPasswordControl?.updateValueAndValidity();
  }

  private setRegisterModeValidators(): void {
    const passwordControl = this.registerForm.get('password');
    const confirmPasswordControl = this.registerForm.get('confirmPassword');
    passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    confirmPasswordControl?.setValidators([Validators.required, Validators.minLength(6)]);
    passwordControl?.updateValueAndValidity();
    confirmPasswordControl?.updateValueAndValidity();
  }

  private setRankValidators(): void {
    const rankControl = this.registerForm.get('rankId');
    if (this.showRankSelect) {
      rankControl?.setValidators([Validators.required]);
    } else {
      rankControl?.clearValidators();
      rankControl?.setValue(null);
    }
    rankControl?.updateValueAndValidity();
    this.setRankControlState();
  }

  private getConnectedRole(): string {
    return (this.authService.getUserInfo()?.role || '').trim().toLowerCase();
  }

  private getDefaultRegisterUserType(): string {
    if (this.isInstructorConnected) {
      return 'student';
    }
    if (this.isAdminConnected) {
      return 'instructor';
    }
    return 'guest';
  }

  private loadRanks(): void {
    this.isRanksLoading = true;
    this.ranksError = '';
    this.setRankValidators();
    this.setRankControlState();
    this.ranksService.getRanks().subscribe({
      next: (ranks) => {
        const filteredRanks = this.filterRanksByRole(ranks || []);
        this.ranks = [...filteredRanks].sort((a, b) => {
          const aOrder = a.display_order ?? 0;
          const bOrder = b.display_order ?? 0;
          return aOrder - bOrder;
        });
        this.isRanksLoading = false;
        this.setRankControlState();
      },
      error: (error) => {
        console.error('Ranks load error:', error);
        this.ranksError = 'שגיאה בטעינת דרגות. נסה שוב מאוחר יותר.';
        this.isRanksLoading = false;
        this.setRankControlState();
      }
    });
  }

  private filterRanksByRole(ranks: Rank[]): Rank[] {
    if (this.isAdminConnected) {
      return ranks;
    }
    if (this.isInstructorConnected) {
      return ranks.filter(rank => {
        const typeNormalized = (rank.rank_type || '').replace(/\s+/g, '').trim().toLowerCase();
        const nameNormalized = (rank.name || '').replace(/\s+/g, '').trim().toLowerCase();
        const slugNormalized = (rank.slug || '').replace(/\s+/g, '').trim().toLowerCase();
        return ![typeNormalized, nameNormalized, slugNormalized].includes('daishihan');
      });
    }
    return ranks;
  }

  private getNormalizedRegisterUserType(): string {
    return String(this.registerForm.get('userType')?.value || '').trim().toLowerCase();
  }

  private syncUserTypeWithRole(): void {
    const control = this.registerForm.get('userType');
    if (!control) {
      return;
    }
    if (this.isInstructorConnected) {
      if (this.getNormalizedRegisterUserType() !== 'student') {
        control.setValue('student', { emitEvent: false });
      }
      return;
    }
    if (this.isAdminConnected) {
      if (control.pristine || !control.value) {
        control.setValue(this.getDefaultRegisterUserType(), { emitEvent: false });
      }
      return;
    }
    if (control.pristine) {
      control.setValue('guest', { emitEvent: false });
    }
  }

  private updateRegisterControlStates(): void {
    this.setUserTypeControlState();
    this.setRankControlState();
  }

  private setUserTypeControlState(): void {
    const control = this.registerForm.get('userType');
    if (!control) {
      return;
    }
    if (this.showLoginTab) {
      if (this.getNormalizedRegisterUserType() !== 'guest') {
        control.setValue('guest', { emitEvent: false });
      }
      control.enable({ emitEvent: false });
      return;
    }
    if (this.isInstructorConnected) {
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
    }
  }

  private setRankControlState(): void {
    const control = this.registerForm.get('rankId');
    if (!control) {
      return;
    }
    const shouldDisable = this.isRanksLoading || !this.showRankSelect;
    if (shouldDisable) {
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
    }
  }

  private hasRegisterChanges(): boolean {
    if (!this.registeredUserSnapshot) {
      return false;
    }
    const currentSnapshot = this.buildRegisterSnapshot(this.registerForm.value);
    return !this.areRegisterSnapshotsEqual(currentSnapshot, this.registeredUserSnapshot);
  }

  private buildRegisterSnapshot(source: Record<string, any>): Record<string, string | null> {
    const { confirmPassword, ...rest } = source || {};
    const snapshot: Record<string, string | null> = {};
    Object.keys(rest).forEach(key => {
      const value = rest[key];
      if (value === null || value === undefined) {
        snapshot[key] = null;
        return;
      }
      if (typeof value === 'string') {
        const trimmed = value.trim();
        snapshot[key] = trimmed === '' ? null : trimmed;
        return;
      }
      snapshot[key] = String(value);
    });
    return snapshot;
  }

  private areRegisterSnapshotsEqual(
    current: Record<string, string | null>,
    previous: Record<string, string | null>
  ): boolean {
    const keys = new Set([...Object.keys(current), ...Object.keys(previous)]);
    for (const key of keys) {
      if ((current[key] || null) !== (previous[key] || null)) {
        return false;
      }
    }
    return true;
  }
}
