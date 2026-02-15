import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User, UpdateUserRequest } from '../../_services/auth.service';
import { LoginModalService } from '../../_services/login-modal.service';
import { Title, Meta } from '@angular/platform-browser';
import { UserDetailsHeroComponent } from '../user-details-hero/user-details-hero.component';

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

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private title: Title,
    private meta: Meta,
    private loginModalService: LoginModalService
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
}
