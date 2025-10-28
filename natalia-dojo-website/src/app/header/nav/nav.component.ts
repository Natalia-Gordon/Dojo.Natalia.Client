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