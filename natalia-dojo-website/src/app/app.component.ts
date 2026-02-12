import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { LoginComponent } from './login/login.component';
import { AuthDialogComponent } from './core/dialogs/auth-dialog/auth-dialog.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, CommonModule, HeaderComponent, FooterComponent, LoginComponent, AuthDialogComponent]
})
export class AppComponent implements OnInit {
  title = 'Bujinkan Ninjutsu Natalia Dojo';
  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
}
