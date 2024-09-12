import { Component } from '@angular/core';
import { CommentsComponent } from "../../../../blog/articles/comments/comments.component";
import { SidebarComponent } from "../../../../blog/sidebar/sidebar.component";
import { ZenheroComponent } from "../../../../blog/articles/zen/hero/hero.component";

@Component({
  selector: 'app-introduction',
  standalone: true,
  imports: [CommentsComponent, SidebarComponent, ZenheroComponent],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.css'
})
export class SenseiArticlesZenIntroductionComponent {

}
