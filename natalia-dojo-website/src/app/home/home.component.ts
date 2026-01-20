import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import * as jQuery from "jquery";
import { AboutComponent } from "../about/about.component";
import { WorkoutsComponent } from "../workouts/workouts.component";
import { TeamComponent } from "../team/team.component";
import { RecentArticlesComponent } from "./recent-articles/recent-articles.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [AboutComponent, WorkoutsComponent, TeamComponent, RecentArticlesComponent]
})
export class HomeComponent implements OnInit {
    constructor(private title: Title, private meta: Meta) {}
    ngOnInit(): void {
        this.title.setTitle('דוג׳ו נטליה - נינג׳וטסו ואומנויות לחימה באופקים');
        this.meta.updateTag({
            name: 'description',
            content: 'דוג׳ו נטליה - בית ספר לנינג׳וטסו ואומנויות לחימה באופקים. אימוני הגנה עצמית, שיטות עבודה יפניות מסורתיות, פילוסופיה וקהילה מקצועית. הירשם לאימון ניסיון.'
        });
    }
}
