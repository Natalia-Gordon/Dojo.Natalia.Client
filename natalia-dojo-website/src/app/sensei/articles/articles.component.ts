import { Component } from '@angular/core';
import { SidebarComponent } from "../../blog/sidebar/sidebar.component";
import { HeroComponent } from "../../blog/hero/hero.component";

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [SidebarComponent, HeroComponent],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.css'
})
export class SenseiArticlesComponent {

}
