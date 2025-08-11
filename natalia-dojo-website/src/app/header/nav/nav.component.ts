import { Component } from '@angular/core';
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
}