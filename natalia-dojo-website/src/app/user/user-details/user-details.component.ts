import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, User, UpdateUserRequest } from '../../_services/auth.service';
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
  profileForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private title: Title,
    private meta: Meta
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      displayName: [''],
      address: [''],
      phoneNumber: [''],
      dateOfBirth: [''],
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserDetails(userId: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.authService.getUserDetails(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          this.user = user;
          this.populateForm(user);
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading user details:', error);
          this.errorMessage = 'שגיאה בטעינת פרטי המשתמש';
          this.isLoading = false;
        }
      });
  }

  populateForm(user: User): void {
    this.profileForm.patchValue({
      username: user.username || '',
      email: user.email || '',
      displayName: user.displayName || '',
      address: user.address || '',
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      password: '',
      confirmPassword: ''
    });
    
    // Username is always disabled - cannot be changed after creation
    this.profileForm.get('username')?.disable({ onlySelf: true });
    
    // Set form control states based on edit mode (except username)
    if (!this.isEditMode) {
      // Disable form controls in view mode
      this.profileForm.get('email')?.disable({ onlySelf: true });
      this.profileForm.get('displayName')?.disable({ onlySelf: true });
      this.profileForm.get('address')?.disable({ onlySelf: true });
      this.profileForm.get('phoneNumber')?.disable({ onlySelf: true });
      this.profileForm.get('dateOfBirth')?.disable({ onlySelf: true });
    } else {
      // Enable form controls in edit mode (username stays disabled)
      this.profileForm.get('email')?.enable({ onlySelf: true });
      this.profileForm.get('displayName')?.enable({ onlySelf: true });
      this.profileForm.get('address')?.enable({ onlySelf: true });
      this.profileForm.get('phoneNumber')?.enable({ onlySelf: true });
      this.profileForm.get('dateOfBirth')?.enable({ onlySelf: true });
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
      this.profileForm.get('displayName')?.disable({ onlySelf: true });
      this.profileForm.get('address')?.disable({ onlySelf: true });
      this.profileForm.get('phoneNumber')?.disable({ onlySelf: true });
      this.profileForm.get('dateOfBirth')?.disable({ onlySelf: true });
    } else {
      // Enable form controls for editing
      this.profileForm.get('username')?.enable({ onlySelf: true });
      this.profileForm.get('email')?.enable({ onlySelf: true });
      this.profileForm.get('displayName')?.enable({ onlySelf: true });
      this.profileForm.get('address')?.enable({ onlySelf: true });
      this.profileForm.get('phoneNumber')?.enable({ onlySelf: true });
      this.profileForm.get('dateOfBirth')?.enable({ onlySelf: true });
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

    const formValue = this.profileForm.value;
    const updateRequest: UpdateUserRequest = {
      // Username is not included - it cannot be changed after creation
      email: formValue.email,
      displayName: formValue.displayName || null,
      address: formValue.address || null,
      phoneNumber: formValue.phoneNumber || null,
      dateOfBirth: formValue.dateOfBirth || null,
      password: formValue.password || null
    };

    // Remove password from request if it's empty
    if (!updateRequest.password) {
      delete updateRequest.password;
    }

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
          this.errorMessage = error.error?.message || 'שגיאה בעדכון הפרופיל';
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
      const date = new Date(dateString);
      return date.toLocaleDateString('he-IL', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
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
}
