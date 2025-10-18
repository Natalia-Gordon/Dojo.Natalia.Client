import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class NavComponent {
  
  closeMobileMenu(): void {
    // Only close menu on mobile/tablet devices (non-desktop)
    if (window.innerWidth >= 992) {
      return; // Don't close on desktop
    }
    
    // Close the mobile menu by removing the 'show' class
    const navbarCollapse = document.getElementById('navbarCollapse');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      navbarCollapse.classList.remove('show');
    }
    
    // Alternative: Use Bootstrap's collapse method if available
    if (typeof (window as any).bootstrap !== 'undefined') {
      const bsCollapse = new (window as any).bootstrap.Collapse(navbarCollapse, {
        toggle: false
      });
      bsCollapse.hide();
    }
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Only handle dropdown on mobile/tablet devices (non-desktop)
    if (window.innerWidth >= 992) {
      // On desktop, let Bootstrap handle it
      return;
    }
    
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
    // Only handle on mobile/tablet devices (non-desktop)
    if (window.innerWidth >= 992) {
      return;
    }
    
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown');
    
    // If click is outside dropdown, close all dropdowns
    if (!dropdown) {
      document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
        menu.classList.remove('show');
      });
      document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
  }
}