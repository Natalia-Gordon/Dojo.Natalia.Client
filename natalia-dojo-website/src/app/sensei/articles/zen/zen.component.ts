import { Component, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ZenSidebarComponent } from "./sidebar/sidebar.component";
import { ZenHeroComponent } from "./zen-hero/zen-hero.component";

@Component({
  selector: 'app-zen',
  standalone: true,
  imports: [ZenSidebarComponent, ZenHeroComponent],
  templateUrl: './zen.component.html',
  styleUrl: './zen.component.css'
})
export class SenseiArticlesZenComponent implements OnInit {
  constructor(private title: Title, private meta: Meta) {}
  ngOnInit(): void {
    this.title.setTitle('בלוג | פילוסופיית זן - דוג׳ו נטליה');
    this.meta.updateTag({
      name: 'description',
      content: 'בלוג דוג׳ו נטליה - מאמרים מקצועיים בנינג׳וטסו, תנועה יפנית, ומיינדפולנס לאומנויות לחימה.'
    });
  }
}
