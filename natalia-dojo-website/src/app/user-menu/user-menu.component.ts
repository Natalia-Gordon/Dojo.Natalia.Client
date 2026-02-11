import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, UserInfo } from '../_services/auth.service';
import { LoginModalService } from '../_services/login-modal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.css'
})
export class UserMenuComponent implements OnInit, OnDestroy {
  userInfo: UserInfo | null = null;
  isMenuOpen = false;
  isBrowser = false;
  private userSubscription?: Subscription;
  private readonly mobileMaxWidth = 640;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loginModalService: LoginModalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Only initialize in browser to avoid SSR issues
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Get initial user info
    this.userInfo = this.authService.getUserInfo();
    
    // Subscribe to user info changes
    this.userSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
    });
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onAvatarClick(): void {
    if (this.isMobileView()) {
      this.onUserDetailsClick();
      return;
    }
    this.toggleMenu();
  }

  onUserDetailsClick(): void {
    this.closeMenu();
    this.router.navigate(['/user-details']);
  }

  onMenuAvatarClick(): void {
    this.closeMenu();
    this.router.navigate(['/user-details']);
  }

  onRegisterNewUserClick(): void {
    this.closeMenu();
    this.loginModalService.open('register');
  }

  onManageUsersClick(): void {
    this.closeMenu();
    this.router.navigate(['/admin/users']);
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.closeMenu();
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Menu will close anyway as user info is cleared
        this.closeMenu();
      }
    });
  }

  getInitials(): string {
    const source =
      (this.userInfo?.displayName || '').trim() ||
      (this.userInfo?.username || '').trim();

    if (!source) return 'U';

    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first}${last}`;
  }

  isTeacherOrInstructor(): boolean {
    const role = (this.userInfo?.role || '').trim().toLowerCase();
    return role === 'teacher' || role === 'instructor' || role === 'admin';
  }

  isAdmin(): boolean {
    const role = (this.userInfo?.role || '').trim().toLowerCase();
    return role === 'admin';
  }

  private isMobileView(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return window.innerWidth <= this.mobileMaxWidth;
  }

  getLevelColor(level: string | null): string {
    if (!level) return 'bg-gray-600';
    switch (level) {
      case 'Novice': return 'bg-gray-600';
      case 'Intermediate': return 'bg-blue-600';
      case 'Advanced': return 'bg-purple-600';
      case 'Master': return 'bg-red-600';
      default: return 'bg-gray-600';
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
      console.error('Error formatting last login date:', error);
      return '';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.closeMenu();
    }
  }
}
