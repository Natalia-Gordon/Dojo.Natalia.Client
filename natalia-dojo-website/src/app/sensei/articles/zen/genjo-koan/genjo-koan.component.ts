import { Component } from '@angular/core';
import { CommentsComponent } from "../../../../blog/articles/comments/comments.component";
import { ZenSidebarComponent } from "../sidebar/sidebar.component";
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";

@Component({
  selector: 'app-genjo-koan',
  standalone: true,
  imports: [CommentsComponent, ZenSidebarComponent, SharedHeroComponent],
  templateUrl: './genjo-koan.component.html',
  styleUrl: './genjo-koan.component.css'
})
export class SenseiArticlesZenGenjoKoanComponent {

}
