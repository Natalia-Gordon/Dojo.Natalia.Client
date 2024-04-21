import { Component } from '@angular/core';
import { HeroComponent } from "../hero/hero.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { CommentsComponent } from "./comments/comments.component";

@Component({
    selector: 'app-articles',
    standalone: true,
    templateUrl: './articles.component.html',
    styleUrl: './articles.component.css',
    imports: [HeroComponent, SidebarComponent, CommentsComponent]
})
export class ArticlesComponent {

}
