import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { LoginComponent } from '../login/login.component';
import { AuthDialogComponent } from '../core/dialogs/auth-dialog/auth-dialog.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    AuthDialogComponent,
  ],
})
export class MainLayoutComponent implements OnInit {
  isBrowser = false;

  ngOnInit(): void {
    this.isBrowser = typeof window !== 'undefined';
  }
}
