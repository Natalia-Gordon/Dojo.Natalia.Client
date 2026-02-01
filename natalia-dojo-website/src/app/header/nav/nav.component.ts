import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, UserInfo } from '../../_services/auth.service';
import { LoginModalService } from '../../_services/login-modal.service';
import { UserMenuComponent } from '../../user-menu/user-menu.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, UserMenuComponent]
})
export class NavComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  userInfo: UserInfo | null = null;
  isMobileMenuOpen = false;
  private authSubscription?: Subscription;
  private userInfoSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private loginModalService: LoginModalService,
    private router: Router
  ) {}

  openLoginModal(): void {
    this.loginModalService.open();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Logout successful, user info will be cleared automatically
      },
      error: (error) => {
        console.error('Logout error:', error);
      }
    });
  }

  openUserDetails(): void {
    this.router.navigate(['/user-details']);
  }

  getUserInitials(): string {
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

  ngOnInit(): void {
    // Check initial authentication status
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userInfo = this.authService.getUserInfo();
    
    // Subscribe to authentication changes
    this.authSubscription = this.authService.token$.subscribe(token => {
      this.isAuthenticated = !!token;
      if (!token) {
        this.userInfo = null;
      }
    });
    
    // Subscribe to user info changes
    this.userInfoSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.userInfoSubscription?.unsubscribe();
  }

  
  toggleMobileMenu(): void {
    // Only toggle menu on mobile/tablet devices (non-desktop)
    if (window.innerWidth >= 992) {
      return; // Don't toggle on desktop
    }
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    // Only close menu on mobile/tablet devices (non-desktop)
    if (window.innerWidth >= 992) {
      return; // Don't close on desktop
    }
    this.isMobileMenuOpen = false;
  }

  toggleDropdown(event: Event): void {
    // Always prevent event propagation to avoid conflicts
    event.preventDefault();
    event.stopPropagation();
    
    // Find the dropdown menu
    const dropdownToggle = event.target as HTMLElement;
    const dropdown = dropdownToggle.closest('.dropdown');
    
    if (dropdown) {
      const dropdownMenu = dropdown.querySelector('.dropdown-menu') as HTMLElement;
      
      if (dropdownMenu) {
        const isOpen = dropdownMenu.classList.contains('show');
        
        // Close all other dropdowns first
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
        });
        
        // Toggle current dropdown
        if (!isOpen) {
          dropdownMenu.classList.add('show');
          dropdownToggle.setAttribute('aria-expanded', 'true');
        } else {
          dropdownMenu.classList.remove('show');
          dropdownToggle.setAttribute('aria-expanded', 'false');
        }
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown');
    const isDropdownToggle = target.closest('.dropdown-toggle');
    
    // If click is outside dropdown, close all dropdowns
    // This works for both desktop and mobile
    if (!dropdown || (!isDropdownToggle && window.innerWidth >= 992)) {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
      document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
  }
}