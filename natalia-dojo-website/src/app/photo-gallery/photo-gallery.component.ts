import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { GalleryImageComponent, GalleryImage } from '../core/templates/gallery-image/gallery-image.component';

export interface GalleryEvent {
  eventName: string;
  eventDate: string;
  /** Start index of this event's images in the flat galleryImages array. */
  startIndex: number;
  images: GalleryImage[];
}

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [RouterModule, GalleryImageComponent],
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.css']
})
export class PhotoGalleryComponent implements OnInit {
  /** Flat list of all images (for slider and for allImages binding). */
  galleryImages: GalleryImage[] = [];
  /** Images grouped by event name and date. */
  galleryEvents: GalleryEvent[] = [];

  constructor() { }

  /** Current index for the photo slider (0-based). */
  sliderIndex = 0;

  ngOnInit(): void {
    this.galleryImages = [
      {
        src: 'assets/img/carousel-1.jpg',
        alt: 'אימון אמנויות לחימה',
        title: 'אימון אמנויות לחימה',
        description: 'אימון אמנויות לחימה בדוג\'ו – תרגול טכניקות מסורתיות והגנה עצמית.',
        loaded: false,
        error: false
      },
      {
        src: 'assets/img/carousel-2.jpg',
        alt: 'תרגול הגנה עצמית',
        title: 'תרגול הגנה עצמית',
        description: 'תרגול הגנה עצמית עם מדריך מנוסה – למידה מעשית ובטוחה.',
        loaded: false,
        error: false
      },
      {
        src: 'assets/img/carousel-3.jpg',
        alt: 'מדיטציה ומיקוד',
        title: 'מדיטציה ומיקוד',
        description: 'מדיטציה ומיקוד לפני האימון – חיבור בין גוף לנפש.',
        loaded: false,
        error: false
      },
      {
        src: 'assets/img/carousel-4.jpg',
        alt: 'אימון קבוצתי',
        title: 'אימון קבוצתי',
        description: 'אימון קבוצתי בדוג\'ו – עבודה משותפת ואנרגיה חיובית.',
        loaded: false,
        error: false
      }
    ];
    // All current images belong to October 2019 training in Humbodojo in Noda, Japan
    this.galleryEvents = [
      {
        eventName: 'אימון אוקטובר 2019 בהומבודוג\'ו בנודה, יפן',
        eventDate: 'אוקטובר 2019',
        startIndex: 0,
        images: [...this.galleryImages]
      }
    ];
  }

  get currentSliderImage(): GalleryImage | null {
    if (this.galleryImages.length === 0) return null;
    return this.galleryImages[this.sliderIndex] ?? null;
  }

  sliderPrev(): void {
    if (this.galleryImages.length === 0) return;
    this.sliderIndex = this.sliderIndex === 0 ? this.galleryImages.length - 1 : this.sliderIndex - 1;
  }

  sliderNext(): void {
    if (this.galleryImages.length === 0) return;
    this.sliderIndex = (this.sliderIndex + 1) % this.galleryImages.length;
  }

  onImageClick(_image: GalleryImage): void {
    // Handled by gallery-image component (fullscreen)
  }

  onImageLoad(data: { event: Event; index: number }): void {
    if (data.index >= 0 && data.index < this.galleryImages.length) {
      this.galleryImages[data.index].loaded = true;
      this.galleryImages[data.index].error = false;
    }
  }

  onImageError(data: { event: Event; index: number }): void {
    if (data.index >= 0 && data.index < this.galleryImages.length) {
      this.galleryImages[data.index].error = true;
      this.galleryImages[data.index].loaded = false;
    }
  }
} 