import { Component } from '@angular/core';
import { CommentsComponent } from "../../../../blog/articles/comments/comments.component";
import { ZenSidebarComponent } from "../sidebar/sidebar.component";
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";

@Component({
  selector: 'app-fukan-zazengi',
  standalone: true,
  imports: [CommentsComponent, ZenSidebarComponent, SharedHeroComponent],
  templateUrl: './fukan-zazengi.component.html',
  styleUrl: './fukan-zazengi.component.css'
})
export class SenseiArticlesZenFukanZazengiComponent {

}
