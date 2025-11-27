import { Component } from '@angular/core';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';
import { AddcommentComponent } from '../../../../core/templates/addcomment/addcomment.component';

@Component({
  selector: 'app-koan-daily-life',
  standalone: true,
  imports: [SenseiZenHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent, AddcommentComponent],
  templateUrl: './koan-daily-life.component.html',
  styleUrl: './koan-daily-life.component.css'
})
export class KoanDailyLifeComponent {
  comments: Comment[] = [
    {
      id: 1,
      author: 'עמית כהן',
      date: '20 בדצמבר 2024',
      text: 'המאמר הזה פתח לי את העיניים! לא ידעתי שקואנים יכולים להיות גם בחיי היומיום. עכשיו אני מבין שכל בעיה או קושי שאני נתקל בו יכול להיות קואן שלי. זה משנה את כל הגישה שלי לאתגרים.',
      subject: 'קואנים יומיומיים',
      avatar: '/assets/img/avatar_yosi.jpg',
      replies: [],
      avatarError: false,
      email: 'amit.cohen@example.com'
    },
    {
      id: 2,
      author: 'רותם ישראלי',
      date: '21 בדצמבר 2024',
      text: 'החלק על "איש הזן לא משאיר עקבות" נגע לליבי. זה מזכיר לי לפעול בפשטות, ביעילות, בלי תנועות מיותרות. כשאני מתרגל את זה בחיי היומיום, אני מרגיש יותר קליל וממוקד.',
      subject: 'פעולה ללא עקבות',
      avatar: '/assets/img/avatar_maya.jpg',
      replies: [],
      avatarError: false,
      email: 'rotem.israeli@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}

