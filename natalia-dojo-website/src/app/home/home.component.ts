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
        this.title.setTitle('דף הבית | דוג׳ו נטליה');
        this.meta.updateTag({
            name: 'description',
            content: 'דף הבית של דוג׳ו נטליה - נינג׳וטסו, אומנויות לחימה, מדריכה מוסמכת בתל אביב, שיטות עבודה יפניות, פילוסופיה וקהילה.'
        });
    }
}
