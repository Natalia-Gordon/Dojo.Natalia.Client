import { Component } from '@angular/core';
import { HeroComponent } from "../../../hero/hero.component";
import { SidebarComponent } from "../../../sidebar/sidebar.component";
import { CommentsComponent } from "../../comments/comments.component";

@Component({
    selector: 'app-zen-1',
    standalone: true,
    templateUrl: './zen-1.component.html',
    styleUrl: './zen-1.component.css',
    imports: [HeroComponent, SidebarComponent, CommentsComponent]
})
export class Zen1Component {

}
