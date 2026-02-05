import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

export interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  loaded?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-gallery-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-image.component.html',
  styleUrls: ['./gallery-image.component.css']
})
export class GalleryImageComponent implements OnInit, OnDestroy {
  @Input() image!: GalleryImage;
  @Input() index!: number;
  @Input() allImages: GalleryImage[] = [];
  @Output() imageClick = new EventEmitter<GalleryImage>();
  @Output() imageLoad = new EventEmitter<{event: Event, index: number}>();
  @Output() imageError = new EventEmitter<{event: Event, index: number}>();

  selectedImage: GalleryImage | null = null;
  showModal = false;
  showFullImageModal = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (!this.image.loaded && !this.image.error) {
          console.log(`Fallback: Hiding loader for image ${this.index}`);
          this.image.loaded = true;
        }
      }, 3000);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed (e.g., clear specific timeouts if they were stored per instance)
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.showModal && !this.showFullImageModal) return;

    switch (event.key) {
      case 'Escape':
        if (this.showFullImageModal) {
          this.closeFullImageModal();
        } else {
          this.closeModal();
        }
        break;
      case 'ArrowLeft':
        if (this.showModal && !this.showFullImageModal) {
          this.nextImage();
        }
        break;
      case 'ArrowRight':
        if (this.showModal && !this.showFullImageModal) {
          this.previousImage();
        }
        break;
    }
  }

  // Prevent right-click context menu
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event): void {
    event.preventDefault();
  }

  // Prevent drag and drop
  @HostListener('dragstart', ['$event'])
  onDragStart(event: Event): void {
    event.preventDefault();
  }

  // Prevent image saving
  @HostListener('selectstart', ['$event'])
  onSelectStart(event: Event): void {
    event.preventDefault();
  }

  onImageClick(): void {
    this.selectedImage = this.image;
    this.showModal = true;
    this.showFullImageModal = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  onImageLoad(event: Event): void {
    this.image.loaded = true;
    this.image.error = false;
    this.imageLoad.emit({ event, index: this.index });
  }

  onImageError(event: Event): void {
    this.image.error = true;
    this.image.loaded = false;
    this.imageError.emit({ event, index: this.index });
  }

  closeModal(): void {
    this.showModal = false;
    this.showFullImageModal = false;
    this.selectedImage = null;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  viewFullImage(): void {
    this.showFullImageModal = true;
    this.showModal = false;
  }

  closeFullImageModal(): void {
    this.showFullImageModal = false;
    this.showModal = true;
  }

  nextImage(): void {
    if (this.selectedImage && this.allImages.length > 0) {
      const currentIndex = this.allImages.findIndex(img => img.src === this.selectedImage?.src);
      const nextIndex = (currentIndex + 1) % this.allImages.length;
      this.selectedImage = this.allImages[nextIndex];
    }
  }

  previousImage(): void {
    if (this.selectedImage && this.allImages.length > 0) {
      const currentIndex = this.allImages.findIndex(img => img.src === this.selectedImage?.src);
      const prevIndex = currentIndex === 0 ? this.allImages.length - 1 : currentIndex - 1;
      this.selectedImage = this.allImages[prevIndex];
    }
  }
} 