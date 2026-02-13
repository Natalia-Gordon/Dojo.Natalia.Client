import { Component, OnInit } from '@angular/core';

import { GalleryImageComponent, GalleryImage } from '../core/templates/gallery-image/gallery-image.component';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [GalleryImageComponent],
  templateUrl: './photo-gallery.component.html',
  styleUrls: ['./photo-gallery.component.css']
})
export class PhotoGalleryComponent implements OnInit {
  galleryImages: GalleryImage[] = [];

  constructor() { }

  ngOnInit(): void {
    this.galleryImages = [
      {
        src: 'assets/img/carousel-1.jpg',
        alt: 'אימון אמנויות לחימה',
        title: 'אימון אמנויות לחימה',
        loaded: false,
        error: false
      },
      {
        src: 'assets/img/carousel-2.jpg',
        alt: 'תרגול הגנה עצמית',
        title: 'תרגול הגנה עצמית',
        loaded: false,
        error: false
      },
      {
        src: 'assets/img/carousel-3.jpg',
        alt: 'מדיטציה ומיקוד',
        title: 'מדיטציה ומיקוד',
        loaded: false,
        error: false
      },
      {
        src: 'assets/img/carousel-4.jpg',
        alt: 'אימון קבוצתי',
        title: 'אימון קבוצתי',
        loaded: false,
        error: false
      }
    ];
  }

  onImageClick(image: GalleryImage): void {
    // This method is now handled by the template component
    console.log('Image clicked:', image.title);
  }

  onImageLoad(data: {event: Event, index: number}): void {
    console.log(`Image ${data.index} loaded successfully`);
    if (data.index >= 0 && data.index < this.galleryImages.length) {
      this.galleryImages[data.index].loaded = true;
      this.galleryImages[data.index].error = false;
    }
  }

  onImageError(data: {event: Event, index: number}): void {
    console.log(`Image ${data.index} failed to load`);
    if (data.index >= 0 && data.index < this.galleryImages.length) {
      this.galleryImages[data.index].error = true;
      this.galleryImages[data.index].loaded = false;
    }
  }
} 