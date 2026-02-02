import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthDialogComponent } from './core/dialogs/auth-dialog/auth-dialog.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, HeaderComponent, FooterComponent, HomeComponent, LoginComponent, AuthDialogComponent]
})
export class AppComponent {
  title = 'Natalia Ninjutsu Dojo';
}
