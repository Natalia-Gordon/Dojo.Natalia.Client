import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
    selector: 'app-about',
    standalone: true,
    templateUrl: './about.component.html',
    styleUrl: './about.component.css',
    imports: []
})
export class AboutComponent implements OnInit {
    constructor(private title: Title, private meta: Meta) {}
    ngOnInit(): void {
        this.title.setTitle('אודות | דוג׳ו נטליה');
        this.meta.updateTag({
            name: 'description',
            content: "ברוכים הבאים לעמוד האודות של דוג׳ו נטליה גורדון. קראו על דרכי, עקרונות האימון וניסיון עשיר בנינג׳וטסו."
        });
    }
}
