import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare var $: any; // Declare $ to avoid TypeScript errors with jQuery

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial.component.html',
  styleUrl: './testimonial.component.css'
})
export class TestimonialComponent implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Running ngAfterViewInit on browser platform.');
      if (typeof $ !== 'undefined') {
        console.log('jQuery ($) is defined.');
        // Testimonials carousel initialization
        $("#testimonials-list.testimonial-carousel").owlCarousel({
          autoplay: true,
          smartSpeed: 1000,
          items: 1,
          dots: true,
          loop: true,
          nav: true,
          navText: ["<i class='bi bi-arrow-right'></i>", "<i class='bi bi-arrow-left'></i>"],
          rtl: true,
          responsive: {
            0: {
              items: 1
            }
          }
        });
        console.log('Owl Carousel initialization attempted.');
      } else {
        console.error('jQuery ($) is not defined. Owl Carousel cannot be initialized.');
      }
    }
  }
}
