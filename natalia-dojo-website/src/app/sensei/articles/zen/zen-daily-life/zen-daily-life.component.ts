import { Component } from '@angular/core';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';
import { AddcommentComponent } from '../../../../core/templates/addcomment/addcomment.component';

@Component({
  selector: 'app-zen-daily-life',
  standalone: true,
  imports: [SenseiZenHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent, AddcommentComponent, DatePipe],
  templateUrl: './zen-daily-life.component.html',
  styleUrl: './zen-daily-life.component.css'
})
export class ZenDailyLifeComponent {
  articleDate = new Date('2025-11-27');
  
  comments: Comment[] = [
    {
      id: 1,
      author: 'מיכל דוד',
      date: '16 בדצמבר 2024',
      text: 'המסר של 5-10 דקות בבוקר זה כל כך מעשי! אני מתחיל את היום עם זה-זן קצר ואני מרגיש את ההבדל. המאמר מסביר בצורה ברורה איך להביא את הזן לחיי היומיום. זה לא רק תרגול במנזר - זה דרך חיים.',
      subject: 'תרגול מעשי',
      avatar: '/assets/img/avatar_maya.jpg',
      replies: [],
      avatarError: false,
      email: 'michal.david@example.com'
    },
    {
      id: 2,
      author: 'תומר לוי',
      date: '17 בדצמבר 2024',
      text: 'החלק על "יותר תרגול ופחות דיבורים" נגע לליבי. לפעמים אנחנו מחפשים הסברים מורכבים, אבל האמת היא פשוטה - לשבת, לנשום, להיות. המאמר הזה מזכיר לי את הפשטות של הדרך.',
      subject: 'פשטות הדרך',
      avatar: '/assets/img/avatar_erez.jpg',
      replies: [],
      avatarError: false,
      email: 'tomer.levi@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}

