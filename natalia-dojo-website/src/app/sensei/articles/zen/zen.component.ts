import { Component } from '@angular/core';
import { ZenSidebarComponent } from "./sidebar/sidebar.component";
import { SharedHeroComponent } from "../../../shared/components/hero/hero.component";

@Component({
  selector: 'app-zen',
  standalone: true,
  imports: [ZenSidebarComponent, SharedHeroComponent],
  templateUrl: './zen.component.html',
  styleUrl: './zen.component.css'
})
export class SenseiArticlesZenComponent {

}
