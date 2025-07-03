import { Component } from '@angular/core';
import { HeroComponent } from "../hero/hero.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { AddcommentComponent } from "./addcomment/addcomment.component";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-articles',
    standalone: true,
    templateUrl: './articles.component.html',
    styleUrl: './articles.component.css',
    imports: [HeroComponent, SidebarComponent, AddcommentComponent, CommonModule]
})
export class ArticlesComponent {

}
