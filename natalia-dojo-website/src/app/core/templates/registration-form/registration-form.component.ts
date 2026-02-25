import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../_services/auth.service';
import { Rank, RanksService } from '../../../_services/ranks.service';
import { LoginModalService, UserToEdit } from '../../../_services/login-modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.css'
})
export class RegistrationFormComponent implements OnInit, OnDestroy {
  @Input() showLoginTab = false;

  /** When set, form opens in edit mode for this user (e.g. from user management). */
  @Input() userToEdit: UserToEdit | null = null;

  /** Emitted when registration succeeds and user is not authenticated (username to pre-fill login). */
  @Output() switchToLoginTab = new EventEmitter<string>();

  registerForm!: FormGroup;
  ranks: Rank[] = [];
  isRanksLoading = false;
  ranksError = '';
  isRegisterLoading = false;
  registerError = '';
  registerSuccess = '';
  private registeredUserId: number | null = null;
  private registeredUserSnapshot: Record<string, string | null> | null = null;
  private userInfoSubscription?: Subscription;
  private userTypeSubscription?: Subscription;

  constructor(
    @Inject(FormBuilder) private fb: FormBuilder,
    private authService: AuthService,
    private ranksService: RanksService,
    private loginModalService: LoginModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.userToEdit) {
      this.setUserToEdit(this.userToEdit);
    } else {
      this.resetFormState();
    }

    this.userInfoSubscription = this.authService.userInfo$.subscribe(() => {
      this.syncUserTypeWithRole();
      this.setUserTypeControlState();
      this.setPhoneValidators();
      if (this.showRankSelect) {
        this.loadRanks();
      } else {
        this.ranks = [];
        this.setRankValidators();
      }
    });

    this.userTypeSubscription = this.registerForm.get('userType')?.valueChanges.subscribe(() => {
      this.setRankControlState();
      this.setPhoneValidators();
      if (this.showRankSelect) {
        this.loadRanks();
      } else {
        this.ranks = [];
        this.setRankValidators();
      }
    });

    this.updateRegisterControlStates();
    if (this.showRankSelect) {
      this.loadRanks();
    }
  }

  ngOnDestroy(): void {
    this.userInfoSubscription?.unsubscribe();
    this.userTypeSubscription?.unsubscribe();
  }

  closeModal(): void {
    this.loginModalService.close();
    this.resetFormState();
  }

  resetFormState(): void {
    this.registerError = '';
    this.registerSuccess = '';
    this.registeredUserId = null;
    this.registeredUserSnapshot = null;
    this.registerForm.reset({ userType: this.getDefaultRegisterUserType(), rankId: null, isActive: true });
    this.setRegisterModeValidators();
    this.updateRegisterControlStates();
  }

  /** Populate form for editing an existing user (called from user management). */
  setUserToEdit(user: UserToEdit | null): void {
    if (!user) {
      this.resetFormState();
      return;
    }
    this.registerError = '';
    this.registerSuccess = '';
    this.registeredUserId = user.id;
    const userType = this.mapRoleToUserType(user.role);
    this.registerForm.patchValue({
      username: user.username ?? '',
      email: user.email ?? '',
      password: '',
      confirmPassword: '',
      userType: userType || this.getDefaultRegisterUserType(),
      rankId: user.currentRankId ?? null,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      displayName: user.displayName ?? '',
      phone: user.phone ?? '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      profileImageUrl: user.profileImageUrl ?? '',
      bio: user.bio ?? '',
      isActive: user.isActive !== false
    });
    this.setUpdateModeValidators();
    this.registeredUserSnapshot = this.buildRegisterSnapshot(this.registerForm.value);
    this.updateRegisterControlStates();
    if (this.showRankSelect) {
      this.loadRanks();
    }
  }

  private mapRoleToUserType(role?: string | null): string {
    const r = (role || '').trim().toLowerCase();
    if (r === 'admin') return 'instructor';
    if (r === 'instructor' || r === 'teacher') return 'instructor';
    if (r === 'student') return 'student';
    return 'guest';
  }

  private initForm(): void {
    this.registerForm = this.fb.group(
      {
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
        bio: [''],
        isActive: [true]
      },
      { validators: [this.passwordsMatchValidator] }
    );
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password && !confirmPassword) {
      return null;
    }
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isRegisterLoading = true;
    this.registerError = '';
    this.registerSuccess = '';

    const { confirmPassword, ...request } = this.registerForm.value;

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
      next: createdUser => {
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
        this.switchToLoginTab.emit(request.username || request.email || '');
        this.registerForm.reset({ userType: this.getDefaultRegisterUserType(), rankId: null, isActive: true });
        this.setRegisterModeValidators();
      },
      error: error => {
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

  onUpdateRegisteredUser(): void {
    if (!this.registeredUserId) return;
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isRegisterLoading = true;
    this.registerError = '';

    const { confirmPassword, username, ...updateRequest } = this.registerForm.value;

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
      next: updatedUser => {
        this.isRegisterLoading = false;
        const displayName = this.getRegisteredDisplayName(updatedUser, this.registerForm.value);
        this.registerSuccess = `הצלחה: ${displayName} עודכן בהצלחה`;
        this.registeredUserSnapshot = this.buildRegisterSnapshot(this.registerForm.value);
        this.registerForm.markAsPristine();
        if (this.isAdminConnected || this.isInstructorConnected) {
          this.authService.notifyUsersRefresh();
        }
      },
      error: () => {
        this.isRegisterLoading = false;
        this.registerError = 'שגיאה בעדכון משתמש. אנא נסה שוב.';
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  get registerPassword() {
    return this.registerForm.get('password');
  }

  get registerConfirmPassword() {
    return this.registerForm.get('confirmPassword');
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

  /** Show update button when editing existing user from user management */
  get showEditUserUpdateButton(): boolean {
    return !!this.registeredUserId && this.isAdminConnected && !this.showLoginTab;
  }

  get showRankSelect(): boolean {
    if (this.showLoginTab) return false;
    if (this.isInstructorConnected) return true;
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

  private getRegisteredDisplayName(
    createdUser: { displayName: string | null; username: string | null } | null | undefined,
    request: Record<string, unknown>
  ): string {
    const responseDisplayName = (createdUser?.displayName || '').trim();
    if (responseDisplayName) return responseDisplayName;

    const requestDisplayName = ((request['displayName'] as string) || '').trim();
    if (requestDisplayName) return requestDisplayName;

    const fullName = `${request['firstName'] || ''} ${request['lastName'] || ''}`.trim();
    if (fullName) return fullName;

    return (
      (createdUser?.username || (request['username'] as string) || (request['email'] as string) || 'משתמש חדש')
    ).trim();
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
    if (this.isInstructorConnected) return 'student';
    if (this.isAdminConnected) return 'instructor';
    return 'guest';
  }

  private loadRanks(): void {
    this.isRanksLoading = true;
    this.ranksError = '';
    this.setRankValidators();
    this.setRankControlState();
    this.ranksService.getRanks().subscribe({
      next: ranks => {
        const filteredRanks = this.filterRanksByRole(ranks || []);
        this.ranks = [...filteredRanks].sort((a, b) => {
          const aOrder = a.display_order ?? 0;
          const bOrder = b.display_order ?? 0;
          return aOrder - bOrder;
        });
        this.isRanksLoading = false;
        this.setRankControlState();
      },
      error: () => {
        this.ranksError = 'שגיאה בטעינת דרגות. נסה שוב מאוחר יותר.';
        this.isRanksLoading = false;
        this.setRankControlState();
      }
    });
  }

  private filterRanksByRole(ranks: Rank[]): Rank[] {
    if (this.isAdminConnected) return ranks;
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

  private syncUserTypeWithRole(): void {
    const control = this.registerForm.get('userType');
    if (!control) return;
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

  private getNormalizedRegisterUserType(): string {
    return String(this.registerForm.get('userType')?.value || '').trim().toLowerCase();
  }

  private updateRegisterControlStates(): void {
    this.setUserTypeControlState();
    this.setRankControlState();
    this.setPhoneValidators();
  }

  /** Phone is required when registering/editing an instructor or teacher. */
  private setPhoneValidators(): void {
    const phoneControl = this.registerForm.get('phone');
    if (!phoneControl) return;
    const isInstructor = this.getNormalizedRegisterUserType() === 'instructor';
    if (isInstructor) {
      phoneControl.setValidators([Validators.required]);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }

  private setUserTypeControlState(): void {
    const control = this.registerForm.get('userType');
    if (!control) return;
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
    if (!control) return;
    const shouldDisable = this.isRanksLoading || !this.showRankSelect;
    if (shouldDisable) {
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
    }
  }

  private hasRegisterChanges(): boolean {
    if (!this.registeredUserSnapshot) return false;
    const currentSnapshot = this.buildRegisterSnapshot(this.registerForm.value);
    return !this.areRegisterSnapshotsEqual(currentSnapshot, this.registeredUserSnapshot);
  }

  private buildRegisterSnapshot(source: Record<string, unknown>): Record<string, string | null> {
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
