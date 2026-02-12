import { Component } from '@angular/core';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';
@Component({
  selector: 'app-practice-when-living',
  standalone: true,
  imports: [SenseiZenHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent, DatePipe],
  templateUrl: './practice-when-living.component.html',
  styleUrl: './practice-when-living.component.css'
})
export class PracticeWhenLivingComponent {
  articleDate = new Date('2025-11-27');
  
  comments: Comment[] = [
    {
      id: 1,
      author: 'דני רוזן',
      date: '18 בדצמבר 2024',
      text: 'זה המאמר הכי מעשי שקראתי! הרעיון של "להתאמן כשחיים, לחיותתאמנים" שינה את הגישה שלי. עכשיו אני מבין שכל פעולה יכולה להיות תרגול - מהליכה ברחוב ועד שתיית תה. זה משחרר ומעצים.',
      subject: 'תרגול בחיי היום יום',
      avatar: '/assets/img/avatar_david.jpg',
      replies: [],
      avatarError: false,
      email: 'danny.rozen@example.com'
    },
    {
      id: 2,
      author: 'יעל שמיר',
      date: '19 בדצמבר 2024',
      text: 'החלק על "הכוח הפנימי" נגע לליבי עמוק. כשאני יושבת זה-זן, אני מרגישה איך הגחלים נדלקות מחדש. המאמר הזה מזכיר לי שאסור לוותר, גם כשקשה. הרוח של הזה-זן נותנת כוח אמיתי.',
      subject: 'כוח פנימי',
      avatar: '/assets/img/avatar_noa.jpg',
      replies: [],
      avatarError: false,
      email: 'yael.shachar@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}

