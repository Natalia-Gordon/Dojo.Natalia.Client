import { Component, HostListener, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../_services/newsletter.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit, OnDestroy {
  isBackToTopVisible = false;
  isBrowser = false;
  currentYear = new Date().getFullYear();
  private scrollListener?: () => void;

  newsletterEmail = '';
  newsletterLoading = false;
  newsletterMessage = '';
  newsletterSuccess = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private newsletterService: NewsletterService
  ) {
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

  onNewsletterSubmit(): void {
    const email = this.newsletterEmail?.trim();
    if (!email) return;

    this.newsletterLoading = true;
    this.newsletterMessage = '';
    this.newsletterSuccess = false;

    this.newsletterService.subscribe(email).subscribe({
      next: (result) => {
        this.newsletterLoading = false;
        if (result.success) {
          this.newsletterEmail = '';
          this.newsletterSuccess = true;
          this.newsletterMessage = result.alreadySubscribed
            ? 'כתובת המייל כבר רשומה אצלנו. תודה!'
            : 'נרשמת בהצלחה!';
        } else {
          this.newsletterSuccess = false;
          this.newsletterMessage = result.error;
        }
      },
      error: () => {
        this.newsletterLoading = false;
        this.newsletterSuccess = false;
        this.newsletterMessage = 'אירעה שגיאה. נסי שוב מאוחר יותר.';
      }
    });
  }

  scrollToTop(event: Event): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;
    // Instant jump to top to avoid any initial delay
    window.scrollTo(0, 0);
  }
}
