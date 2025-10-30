import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  isBackToTopVisible = false;

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isBackToTopVisible = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) > 200;
  }

  onSave() {
    console.log(' saved!');
  }

  onSubmit() {
    console.log('Form submitted!');
  }

  scrollToTop(event: Event): void {
    event.preventDefault();
    // Instant jump to top to avoid any initial delay
    window.scrollTo(0, 0);
  }
}
