import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { NgOptimizedImage } from '@angular/common';
import * as jQuery from "jquery";
import { AboutComponent } from "../about/about.component";
import { WorkoutsComponent } from "../workouts/workouts.component";
import { RecentArticlesComponent } from "./recent-articles/recent-articles.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [AboutComponent, WorkoutsComponent, RecentArticlesComponent, NgOptimizedImage]
})
export class HomeComponent implements OnInit, AfterViewInit {
    @ViewChild('headerCarousel') headerCarouselRef?: ElementRef<HTMLDivElement>;

    readonly carouselImages = [
        'assets/img/carousel-1.jpg',
        'assets/img/carousel-2.jpg',
        'assets/img/carousel-3.jpg',
        'assets/img/carousel-4.jpg'
    ];
    activeSlideIndex = 0;

    constructor(private title: Title, private meta: Meta) {}
    ngOnInit(): void {
        this.title.setTitle('דוג׳ו נטליה - נינג׳וטסו ואומנויות לחימה');
        this.meta.updateTag({
            name: 'description',
            content: 'דוג׳ו נטליה - בית ספר לנינג׳וטסו ואומנויות לחימה באופקים. אימוני הגנה עצמית, שיטות עבודה יפניות מסורתיות, פילוסופיה וקהילה מקצועית. הירשם לאימון ניסיון.'
        });
    }

    ngAfterViewInit(): void {
        // Ensure title is set after child components (like AboutComponent) initialize
        setTimeout(() => {
            this.title.setTitle('דוג׳ו נטליה - נינג׳וטסו ואומנויות לחימה');
        }, 0);
        // Sync single carousel image with Bootstrap slide (avoids NG02960 on hidden slides)
        const el = this.headerCarouselRef?.nativeElement;
        if (el) {
            el.addEventListener('slid.bs.carousel', (e: Event) => {
                const to = (e as { to?: number }).to;
                if (typeof to === 'number') this.activeSlideIndex = to;
            });
        }
    }
}
