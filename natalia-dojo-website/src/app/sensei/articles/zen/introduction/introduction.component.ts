import { Component } from '@angular/core';
import { CommentsComponent } from "../../../../blog/articles/comments/comments.component";
import { SidebarComponent } from "../../../../blog/sidebar/sidebar.component";
import { ZenheroComponent } from "../../../../blog/articles/zen/hero/hero.component";
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";
import { ZenSidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: 'app-introduction',
  standalone: true,
  imports: [CommentsComponent, SharedHeroComponent, ZenSidebarComponent],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.css'
})
export class SenseiArticlesZenIntroductionComponent {

}
