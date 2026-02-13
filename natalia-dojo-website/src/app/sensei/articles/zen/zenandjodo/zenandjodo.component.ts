import { Component } from '@angular/core';
import { SidebarComponent } from '../../../../blog/sidebar/sidebar.component';
import { ZenheroComponent } from '../../../../blog/articles/zen/hero/hero.component';
import { SharedHeroComponent } from '../../../../shared/components/hero/hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';

import { CommentsListComponent } from '../../../../core/templates/comments-list/comments-list.component';

@Component({
  selector: 'app-zenandjodo',
  standalone: true,
  imports: [SharedHeroComponent, ZenSidebarComponent, CommentsListComponent],
  templateUrl: './zenandjodo.component.html',
  styleUrl: './zenandjodo.component.css'
})
export class SenseiArticlesZenAndJodoComponent {
  comments = [
    {
      id: 1,
      author: 'יוסי כהן',
      date: '8 נובמבר 2025',
      text: 'איזה מאמר מרגש ומעורר השראה! אני מרגיש שהמילים חודרות עמוק לנשמה ומזכירות לנו את החשיבות של חיבור פנימי. תודה רבה על השיתוף.',
      subject: 'מאמר מרגש',
      avatar: '/assets/img/avatar_yosi.jpg',
      replies: [],
      avatarError: false,
      email: 'yosi.cohen@example.com'
    }
    // you can update/add other comments as relevant
  ];

  addNewComment(comment: any) {
    this.comments.push(comment);
  }
}
