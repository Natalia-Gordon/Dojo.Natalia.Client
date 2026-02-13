import { Component, Input, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.css'
})
export class AudioPlayerComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() audioSrc: string = '';
  @Input() title: string = 'האזנה למאמר';
  @Input() author: string = '';
  
  @ViewChild('audioElement', { static: false }) audioElement!: ElementRef<HTMLAudioElement>;
  
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  
  private updateInterval: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Audio will be initialized after view init
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return; // Skip audio initialization on server
    }
    
    if (this.audioElement?.nativeElement) {
      const audio = this.audioElement.nativeElement;
      
      audio.addEventListener('loadedmetadata', () => {
        this.duration = audio.duration;
        this.isLoading = false;
      });
      
      audio.addEventListener('timeupdate', () => {
        this.currentTime = audio.currentTime;
      });
      
      audio.addEventListener('play', () => {
        this.isPlaying = true;
      });
      
      audio.addEventListener('pause', () => {
        this.isPlaying = false;
      });
      
      audio.addEventListener('error', (e) => {
        this.hasError = true;
        this.isLoading = false;
        this.isPlaying = false;
        const error = audio.error;
        if (error) {
          switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
              this.errorMessage = 'ההשמעה בוטלה';
              break;
            case error.MEDIA_ERR_NETWORK:
              this.errorMessage = 'שגיאת רשת - לא ניתן לטעון את הקובץ';
              break;
            case error.MEDIA_ERR_DECODE:
              this.errorMessage = 'שגיאת פענוח - הקובץ פגום';
              break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
              this.errorMessage = 'פורמט לא נתמך';
              break;
            default:
              this.errorMessage = 'שגיאה בטעינת האודיו';
          }
        }
      });
      
      audio.addEventListener('loadstart', () => {
        this.isLoading = true;
        this.hasError = false;
      });
      
      audio.addEventListener('canplay', () => {
        this.isLoading = false;
      });
    }
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (isPlatformBrowser(this.platformId) && this.audioElement?.nativeElement) {
      try {
        const audio = this.audioElement.nativeElement;
        if (audio && typeof audio.pause === 'function') {
          audio.pause();
        }
      } catch (error) {
        // Ignore errors during cleanup
      }
    }
  }

  togglePlayPause() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const audio = this.audioElement?.nativeElement;
    if (!audio) return;

    if (this.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        this.hasError = true;
        this.errorMessage = 'לא ניתן להפעיל את האודיו';
      });
    }
  }

  onSeek(event: Event) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const audio = this.audioElement?.nativeElement;
    const input = event.target as HTMLInputElement;
    if (audio && input) {
      const seekTime = (parseFloat(input.value) / 100) * this.duration;
      audio.currentTime = seekTime;
    }
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  get progressPercentage(): number {
    if (!this.duration || !isFinite(this.duration)) {
      return 0;
    }
    return (this.currentTime / this.duration) * 100;
  }
}

