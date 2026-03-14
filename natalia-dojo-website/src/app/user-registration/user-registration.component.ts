import { Component, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService, User } from '../_services/auth.service';
import { LoginModalService, UserToEdit } from '../_services/login-modal.service';
import { RegistrationFormComponent } from '../core/templates/registration-form/registration-form.component';

@Component({
  selector: 'app-user-registration',
  standalone: true,
  imports: [RouterModule, RegistrationFormComponent],
  templateUrl: './user-registration.component.html',
  styleUrl: './user-registration.component.css'
})
export class UserRegistrationComponent implements OnInit, OnDestroy {
  @ViewChild(RegistrationFormComponent) registrationForm?: RegistrationFormComponent;

  /** Edit mode: userId from route; null = create new user */
  userId: number | null = null;
  /** User loaded for edit (when userId is set) */
  userToEdit: UserToEdit | null = null;
  isLoadingUser = false;
  loadUserError: string | null = null;
  isEditMode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loginModalService: LoginModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const idParam = this.route.snapshot.paramMap.get('userId');
    if (idParam) {
      const id = Number(idParam);
      if (!Number.isNaN(id) && id > 0) {
        this.userId = id;
        this.isEditMode = true;
        this.loadUserForEdit();
        return;
      }
    }
    this.userToEdit = null;
    this.isEditMode = false;
  }

  ngOnDestroy(): void {
    this.loginModalService.clearUserToEdit();
  }

  private loadUserForEdit(): void {
    if (this.userId == null) return;
    this.isLoadingUser = true;
    this.loadUserError = null;
    this.authService.getUserDetails(this.userId).subscribe({
      next: (user: User) => {
        this.isLoadingUser = false;
        this.userToEdit = this.userToUserToEdit(user);
        this.loginModalService.clearUserToEdit();
        setTimeout(() => this.registrationForm?.setUserToEdit(this.userToEdit!), 0);
      },
      error: (err) => {
        this.isLoadingUser = false;
        this.loadUserError = err?.error?.message || 'לא ניתן לטעון את פרטי המשתמש. אנא נסי שוב.';
      }
    });
  }

  private userToUserToEdit(user: User): UserToEdit {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      phone: user.phone ?? user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      currentRankId: user.currentRankId,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio,
      isActive: user.isActive
    };
  }

  get pageTitle(): string {
    return this.isEditMode ? 'עדכון משתמש' : 'הרשמה לדוג\'ו';
  }

  get showLoginTab(): boolean {
    return !this.authService.isAuthenticated();
  }

  get isAdmin(): boolean {
    return (this.authService.getUserInfo()?.role ?? '').toLowerCase() === 'admin';
  }

  onSwitchToLoginTab(username: string): void {
    this.router.navigate(['/login']);
  }

  goBack(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin/users']);
    } else {
      this.router.navigate(['/home']);
    }
  }
}
