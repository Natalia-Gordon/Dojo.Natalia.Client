import { Component } from '@angular/core';
import { CommentsComponent } from "../../../../blog/articles/comments/comments.component";
import { ZenSidebarComponent } from "../sidebar/sidebar.component";
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";

@Component({
  selector: 'app-zenki',
  standalone: true,
  imports: [CommentsComponent, ZenSidebarComponent, SharedHeroComponent],
  templateUrl: './zenki.component.html',
  styleUrl: './zenki.component.css'
})
export class SenseiArticlesZenZenkiComponent {

}
