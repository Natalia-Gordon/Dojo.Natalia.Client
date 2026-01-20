import { Component, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService, UserInfo } from '../_services/auth.service';
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
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
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
    if (!this.userInfo?.username) return 'U';
    return this.userInfo.username.charAt(0).toUpperCase();
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.closeMenu();
    }
  }
}
