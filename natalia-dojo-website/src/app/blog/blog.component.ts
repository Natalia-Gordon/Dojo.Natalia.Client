import { Component } from '@angular/core';
import { HeroComponent } from "./hero/hero.component";
import { SidebarComponent } from "./sidebar/sidebar.component";

@Component({
    selector: 'app-blog',
    standalone: true,
    templateUrl: './blog.component.html',
    styleUrl: './blog.component.css',
    imports: [HeroComponent, SidebarComponent]
})
export class BlogComponent {

}
