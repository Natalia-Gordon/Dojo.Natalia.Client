import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User, UpdateUserRequest } from '../../_services/auth.service';
import { LoginModalService } from '../../_services/login-modal.service';
import { Title, Meta } from '@angular/platform-browser';
import { UserDetailsHeroComponent } from '../user-details-hero/user-details-hero.component';
import { PaymentMethodsService, CreateOrUpdatePaymentMethodRequest } from '../../_services/payment-methods.service';
import { InstructorPaymentMethodDto } from '../../_services/events.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserDetailsHeroComponent],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  user: User | null = null;
  isEditMode = false;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isUnauthorized = false;
  profileForm: FormGroup;
  private destroy$ = new Subject<void>();

  paymentMethods: InstructorPaymentMethodDto[] = [];
  isLoadingPaymentMethods = false;
  paymentMethodError: string | null = null;
  showPaymentMethodForm = false;
  editingPaymentMethod: InstructorPaymentMethodDto | null = null;
  isSavingPaymentMethod = false;
  paymentMethodForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private title: Title,
    private meta: Meta,
    private loginModalService: LoginModalService,
    private paymentMethodsService: PaymentMethodsService
  ) {
    this.profileForm = this.fb.group({
      username: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: [''],
      lastName: [''],
      displayName: [''],
      phone: [''], // Use 'phone' to match API
      dateOfBirth: [''],
      bio: [''],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });

    this.paymentMethodForm = this.fb.group({
      paymentType: ['bank_transfer' as 'bit' | 'bank_transfer', Validators.required],
      isDefault: [false],
      phoneNumber: [''],
      bankName: [''],
      accountHolderName: [''],
      accountNumber: [''],
      iban: [''],
      swiftBic: [''],
      bankAddress: [''],
      bankNumber: [''],
      branchName: [''],
      branchNumber: ['']
    });
  }

  ngOnInit(): void {
    this.title.setTitle('פרטי משתמש | דוג׳ו נטליה');
    this.meta.updateTag({ name: 'description', content: 'פרטי משתמש - צפה ועדכן את פרטי הפרופיל שלך' });

    const userInfo = this.authService.getUserInfo();
    if (!userInfo) {
      this.router.navigate(['/home']);
      return;
    }

    this.loadUserDetails(userInfo.userId);

    this.loginModalService.reconnectSuccess$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const info = this.authService.getUserInfo();
        if (info) {
          this.loadUserDetails(info.userId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserDetails(userId: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.isUnauthorized = false;
    
    this.authService.getUserDetails(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          this.user = user;
          this.populateForm(user);
          this.isLoading = false;
          this.isUnauthorized = false;
          if (this.isInstructor()) {
            this.loadPaymentMethods();
          }
        },
        error: (error: any) => {
          console.error('Error loading user details:', error);
          if (error.status === 401 || error.status === 403) {
            // Unauthorized or Forbidden
            this.isUnauthorized = true;
            this.errorMessage = 'הגישה נדחתה. יש להתחבר מחדש';
          } else {
            this.errorMessage = 'שגיאה בטעינת פרטי המשתמש';
            this.isUnauthorized = false;
          }
          this.isLoading = false;
        }
      });
  }

  populateForm(user: User): void {
    // Map phone from API (can be 'phone' or 'phoneNumber')
    const phoneValue = user.phone || user.phoneNumber || '';
    
    this.profileForm.patchValue({
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      displayName: user.displayName || '',
      phone: phoneValue,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      bio: user.bio || '',
      password: '',
      confirmPassword: ''
    });
    
    // Username is always disabled - cannot be changed after creation
    this.profileForm.get('username')?.disable({ onlySelf: true });
    
    // Set form control states based on edit mode (except username)
    if (!this.isEditMode) {
      // Disable form controls in view mode
      this.profileForm.get('email')?.disable({ onlySelf: true });
      this.profileForm.get('firstName')?.disable({ onlySelf: true });
      this.profileForm.get('lastName')?.disable({ onlySelf: true });
      this.profileForm.get('displayName')?.disable({ onlySelf: true });
      this.profileForm.get('phone')?.disable({ onlySelf: true });
      this.profileForm.get('dateOfBirth')?.disable({ onlySelf: true });
      this.profileForm.get('bio')?.disable({ onlySelf: true });
    } else {
      // Enable form controls in edit mode (username stays disabled)
      this.profileForm.get('email')?.enable({ onlySelf: true });
      this.profileForm.get('firstName')?.enable({ onlySelf: true });
      this.profileForm.get('lastName')?.enable({ onlySelf: true });
      this.profileForm.get('displayName')?.enable({ onlySelf: true });
      this.profileForm.get('phone')?.enable({ onlySelf: true });
      this.profileForm.get('dateOfBirth')?.enable({ onlySelf: true });
      this.profileForm.get('bio')?.enable({ onlySelf: true });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword.hasError('passwordMismatch') && password.value === confirmPassword.value) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  toggleEditMode(): void {
    if (this.isEditMode) {
      // Cancel edit - reload original data
      if (this.user) {
        this.populateForm(this.user);
      }
      this.profileForm.get('password')?.setValue('');
      this.profileForm.get('confirmPassword')?.setValue('');
      // Disable form controls (view mode)
      this.profileForm.get('username')?.disable({ onlySelf: true });
      this.profileForm.get('email')?.disable({ onlySelf: true });
      this.profileForm.get('firstName')?.disable({ onlySelf: true });
      this.profileForm.get('lastName')?.disable({ onlySelf: true });
      this.profileForm.get('displayName')?.disable({ onlySelf: true });
      this.profileForm.get('phone')?.disable({ onlySelf: true });
      this.profileForm.get('dateOfBirth')?.disable({ onlySelf: true });
      this.profileForm.get('bio')?.disable({ onlySelf: true });
    } else {
      // Enable form controls for editing (username remains disabled)
      this.profileForm.get('email')?.enable({ onlySelf: true });
      this.profileForm.get('firstName')?.enable({ onlySelf: true });
      this.profileForm.get('lastName')?.enable({ onlySelf: true });
      this.profileForm.get('displayName')?.enable({ onlySelf: true });
      this.profileForm.get('phone')?.enable({ onlySelf: true });
      this.profileForm.get('dateOfBirth')?.enable({ onlySelf: true });
      this.profileForm.get('bio')?.enable({ onlySelf: true });
    }
    this.isEditMode = !this.isEditMode;
    this.errorMessage = null;
    this.successMessage = null;
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.user) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // Use getRawValue() to get all values including disabled controls
    const formValue = this.profileForm.getRawValue();
    
    // Build update request according to API specification
    const updateRequest: UpdateUserRequest = {
      email: formValue.email || null,
      password: formValue.password || null,
      firstName: formValue.firstName || null,
      lastName: formValue.lastName || null,
      displayName: formValue.displayName || null,
      phone: formValue.phone || null,
      profileImageUrl: this.user?.profileImageUrl || null,
      bio: formValue.bio || null,
      dateOfBirth: formValue.dateOfBirth ? formValue.dateOfBirth.trim() || null : null,
      isActive: this.user?.isActive !== undefined ? this.user.isActive : true
    };

    // Remove null/empty values to keep request clean
    Object.keys(updateRequest).forEach(key => {
      if (updateRequest[key as keyof UpdateUserRequest] === null || updateRequest[key as keyof UpdateUserRequest] === '') {
        delete updateRequest[key as keyof UpdateUserRequest];
      }
    });

    this.authService.updateUser(this.user.id, updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser: User) => {
          this.user = updatedUser;
          this.successMessage = 'הפרופיל עודכן בהצלחה';
          this.isEditMode = false;
          this.isLoading = false;
          
          // Clear password fields
          this.profileForm.get('password')?.setValue('');
          this.profileForm.get('confirmPassword')?.setValue('');
          
          // Reload form with updated data
          this.populateForm(updatedUser);
        },
        error: (error: any) => {
          console.error('Error updating user:', error);
          if (error.status === 401 || error.status === 403) {
            // Unauthorized or Forbidden
            this.isUnauthorized = true;
            this.errorMessage = 'הגישה נדחתה. יש להתחבר מחדש';
          } else {
            this.errorMessage = error.error?.message || 'שגיאה בעדכון הפרופיל';
            this.isUnauthorized = false;
          }
          this.isLoading = false;
        }
      });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.profileForm.get(fieldName);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return 'שדה זה נדרש';
      }
      if (control.errors?.['email']) {
        return 'כתובת דוא"ל לא תקינה';
      }
      if (control.errors?.['minlength']) {
        return `מינימום ${control.errors['minlength'].requiredLength} תווים`;
      }
      if (control.errors?.['passwordMismatch']) {
        return 'הסיסמאות לא תואמות';
      }
    }
    return null;
  }

  getDisplayName(): string {
    if (!this.user) return '';
    if (this.user.displayName) {
      return this.user.displayName;
    }
    if (this.user.firstName && this.user.lastName) {
      return `${this.user.firstName} ${this.user.lastName}`;
    }
    return this.user.username || '';
  }

  getUserInitials(): string {
    if (this.user?.displayName) {
      const names = this.user.displayName.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (this.user?.username) {
      return this.user.username.charAt(0).toUpperCase();
    }
    return '?';
  }

  getLevelColor(level: string | null): string {
    if (!level) return 'bg-secondary';
    switch (level) {
      case 'Novice': return 'bg-secondary';
      case 'Intermediate': return 'bg-info';
      case 'Advanced': return 'bg-primary';
      case 'Master': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
      // Handle date-only strings (YYYY-MM-DD) or ISO datetime strings
      const dateStr = dateString.split('T')[0]; // Extract date part if it's a datetime
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
      // Fallback to Date object parsing
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const dayStr = String(date.getDate()).padStart(2, '0');
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const yearStr = date.getFullYear();
      return `${dayStr}/${monthStr}/${yearStr}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  formatLastLogin(lastLoginAt: string | null | undefined): string {
    if (!lastLoginAt) return '';
    try {
      const date = new Date(lastLoginAt);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return '';
    }
  }

  openLoginModal(): void {
    this.loginModalService.openForReconnect(this.user?.username ?? this.authService.getUserInfo()?.username);
  }

  isInstructor(): boolean {
    const r = this.user?.role;
    return r != null && String(r).toLowerCase() === 'instructor';
  }

  loadPaymentMethods(): void {
    if (!this.isInstructor()) return;
    this.isLoadingPaymentMethods = true;
    this.paymentMethodError = null;
    this.paymentMethodsService.getMyPaymentMethods()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => {
          this.paymentMethods = list;
          this.isLoadingPaymentMethods = false;
        },
        error: (err) => {
          this.paymentMethodError = err?.error?.message || 'שגיאה בטעינת שיטות התשלום';
          this.paymentMethods = [];
          this.isLoadingPaymentMethods = false;
        }
      });
  }

  getPaymentMethodDisplayText(pm: InstructorPaymentMethodDto): string {
    if (pm.paymentType === 'bit') {
      return pm.phoneNumber ? `ביט – ${pm.phoneNumber}` : 'ביט';
    }
    const parts: string[] = [];
    if (pm.bankName) parts.push(pm.bankName);
    if (pm.bankNumber || pm.branchName || pm.branchNumber) {
      parts.push([pm.bankNumber, pm.branchName, pm.branchNumber].filter(Boolean).join(' / '));
    }
    if (pm.accountNumber) parts.push(`חשבון ${pm.accountNumber}`);
    if (pm.accountHolderName) parts.push(pm.accountHolderName);
    return parts.length ? parts.join(' · ') : 'העברה בנקאית';
  }

  openAddPaymentMethod(): void {
    this.editingPaymentMethod = null;
    this.paymentMethodForm.reset({
      paymentType: 'bank_transfer',
      isDefault: false,
      phoneNumber: '',
      bankName: '', accountHolderName: '', accountNumber: '', iban: '', swiftBic: '', bankAddress: '', bankNumber: '', branchName: '', branchNumber: ''
    });
    this.showPaymentMethodForm = true;
    this.paymentMethodError = null;
  }

  openEditPaymentMethod(pm: InstructorPaymentMethodDto): void {
    this.editingPaymentMethod = pm;
    this.paymentMethodForm.patchValue({
      paymentType: pm.paymentType,
      isDefault: !!pm.isDefault,
      phoneNumber: pm.phoneNumber || '',
      bankName: pm.bankName || '',
      accountHolderName: pm.accountHolderName || '',
      accountNumber: pm.accountNumber || '',
      iban: pm.iban || '',
      swiftBic: pm.swiftBic || '',
      bankAddress: pm.bankAddress || '',
      bankNumber: pm.bankNumber || '',
      branchName: pm.branchName || '',
      branchNumber: pm.branchNumber || ''
    });
    this.showPaymentMethodForm = true;
    this.paymentMethodError = null;
  }

  closePaymentMethodForm(): void {
    this.showPaymentMethodForm = false;
    this.editingPaymentMethod = null;
    this.paymentMethodError = null;
  }

  buildPaymentMethodRequest(): CreateOrUpdatePaymentMethodRequest | null {
    const v = this.paymentMethodForm.value;
    const paymentType = v.paymentType as 'bit' | 'bank_transfer';
    if (paymentType === 'bit') {
      const phone = (v.phoneNumber || '').trim();
      if (!phone) return null;
      return { paymentType: 'bit', isDefault: !!v.isDefault, phoneNumber: phone };
    }
    const bank: CreateOrUpdatePaymentMethodRequest = {
      paymentType: 'bank_transfer',
      isDefault: !!v.isDefault,
      phoneNumber: null
    };
    const set = (key: keyof CreateOrUpdatePaymentMethodRequest, val: string) => {
      const s = (val || '').trim();
      if (s) (bank as any)[key] = s;
    };
    set('bankName', v.bankName);
    set('accountHolderName', v.accountHolderName);
    set('accountNumber', v.accountNumber);
    set('iban', v.iban);
    set('swiftBic', v.swiftBic);
    set('bankAddress', v.bankAddress);
    set('bankNumber', v.bankNumber);
    set('branchName', v.branchName);
    set('branchNumber', v.branchNumber);
    const hasBank = !!(bank.bankName || bank.accountHolderName || bank.accountNumber || bank.iban || bank.bankNumber || bank.branchName || bank.branchNumber);
    if (!hasBank) return null;
    return bank;
  }

  savePaymentMethod(): void {
    const request = this.buildPaymentMethodRequest();
    if (!request) {
      this.paymentMethodError = this.paymentMethodForm.value.paymentType === 'bit'
        ? 'יש להזין מספר טלפון לביט'
        : 'יש למלא לפחות שדה אחד של פרטי בנק';
      return;
    }
    this.isSavingPaymentMethod = true;
    this.paymentMethodError = null;
    const obs = this.editingPaymentMethod
      ? this.paymentMethodsService.update(this.editingPaymentMethod.id, request)
      : this.paymentMethodsService.create(request);
    obs.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isSavingPaymentMethod = false;
        this.closePaymentMethodForm();
        this.loadPaymentMethods();
      },
      error: (err) => {
        this.paymentMethodError = err?.error?.message || 'שגיאה בשמירת שיטת התשלום';
        this.isSavingPaymentMethod = false;
      }
    });
  }

  deletePaymentMethod(id: number): void {
    if (!confirm('למחוק שיטת תשלום זו?')) return;
    this.paymentMethodsService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadPaymentMethods(),
        error: (err) => {
          this.paymentMethodError = err?.error?.message || 'שגיאה במחיקת שיטת התשלום';
        }
      });
  }

  get paymentTypeFormValue(): 'bit' | 'bank_transfer' {
    return this.paymentMethodForm?.get('paymentType')?.value ?? 'bank_transfer';
  }

  get paymentMethodFormTitle(): string {
    return this.editingPaymentMethod ? 'עריכת שיטת תשלום' : 'הוספת שיטת תשלום';
  }
}
