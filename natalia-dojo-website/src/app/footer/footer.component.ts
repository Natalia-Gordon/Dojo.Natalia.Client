import { Component, HostListener, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, OnDestroy {
  isBackToTopVisible = false;
  isBrowser = false;
  currentYear = new Date().getFullYear();
  private scrollListener?: () => void;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Only bind scroll listener in browser
    if (isPlatformBrowser(this.platformId)) {
      this.scrollListener = () => this.onWindowScroll();
      window.addEventListener('scroll', this.scrollListener);
      // Check initial scroll position
      this.onWindowScroll();
    }
  }

  ngOnDestroy(): void {
    // Remove scroll listener in browser
    if (isPlatformBrowser(this.platformId) && this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  private onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return;
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
    if (!isPlatformBrowser(this.platformId)) return;
    // Instant jump to top to avoid any initial delay
    window.scrollTo(0, 0);
  }
}
