import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-teacher-message',
  standalone: true,
  imports: [CommonModule, SenseiZenHeroComponent, ZenSidebarComponent],
  templateUrl: './teacher-message.component.html',
  styleUrl: './teacher-message.component.css'
})
export class TeacherMessageComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit() {
    // Set page title and meta description for SEO
    this.titleService.setTitle('דברי המורה דני וקסמן | זן וחכמת חיים | דוג\'ו נטליה');
    
    this.metaService.updateTag({
      name: 'description',
      content: 'דברי השראה מהמורה דני וקסמן על תרגול זן בחיי היום-יום, יחסי מורה-תלמיד, והחיבור בין זן לג\'ודו. מאמרים נבחרים וכתבים על חכמת הזן והתרגול היומיומי.'
    });

    // Smooth scroll behavior
    if (typeof document !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'auto';
    }
  }

  navigateToArticle(path: string) {
    this.router.navigateByUrl(path);
  }
}
