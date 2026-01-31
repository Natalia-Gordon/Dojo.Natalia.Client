import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthDialogService } from '../../../_services/auth-dialog.service';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.css'
})
export class AuthDialogComponent implements OnInit, OnDestroy {
  showDialog = false;
  private subscription?: Subscription;

  constructor(
    private authDialogService: AuthDialogService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.subscription = this.authDialogService.isOpen$.subscribe(isOpen => {
      this.showDialog = isOpen;
      if (isPlatformBrowser(this.platformId)) {
        if (isOpen) {
          document.body.classList.add('modal-open');
        } else {
          document.body.classList.remove('modal-open');
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('modal-open');
    }
  }

  onRefresh(): void {
    this.authDialogService.setChoice('refresh');
  }

  onLogout(): void {
    this.authDialogService.setChoice('logout');
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      // Don't allow closing by clicking backdrop - user must choose
    }
  }
}
