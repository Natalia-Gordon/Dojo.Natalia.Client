import { Component, AfterViewInit, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { TestimonialHeroComponent } from './testimonial-hero/testimonial-hero.component';

declare var $: any; // Declare $ to avoid TypeScript errors with jQuery

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [TestimonialHeroComponent],
  templateUrl: './testimonial.component.html',
  styleUrl: './testimonial.component.css'
})
export class TestimonialComponent implements AfterViewInit, OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit(): void {
    this.title.setTitle('המלצות דוג׳ו נטליה');
    this.meta.updateTag({
      name: 'description',
      content: 'חוות דעת וביקורות תלמידים על חוויית אימון אצל נטליה גורדון דוג׳ו בתל אביב.'
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && typeof $ !== 'undefined' && typeof ($ as any).fn?.owlCarousel === 'function') {
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
    }
  }
}
