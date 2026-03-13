import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface GalleryImage {
  src: string;
  alt: string;
  title?: string;
  /** Optional longer description for the slider. */
  description?: string;
  loaded?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-gallery-image',
  standalone: true,
  imports: [],
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
  showFullscreen = false;

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
    if (this.showFullscreen && isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.showFullscreen) return;

    if (event.key === 'Escape') {
      this.closeFullscreen();
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
    this.showFullscreen = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeFullscreen(): void {
    this.showFullscreen = false;
    this.selectedImage = null;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
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
} 