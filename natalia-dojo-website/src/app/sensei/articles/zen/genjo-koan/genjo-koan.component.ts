import { Component } from '@angular/core';
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";
import { ZenSidebarComponent } from "../sidebar/sidebar.component";
import { AddcommentComponent } from "../../../../core/templates/addcomment/addcomment.component";
import { CommonModule } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';

@Component({
  selector: 'app-genjo-koan',
  standalone: true,
  imports: [AddcommentComponent, ZenSidebarComponent, SharedHeroComponent, CommonModule, CommentsListComponent],
  templateUrl: './genjo-koan.component.html',
  styleUrl: './genjo-koan.component.css'
})
export class GenjoKoanComponent {
  comments: Comment[] = [
    {
      id: 1,
      author: 'יוסי כהן',
      date: '1 בינואר 2045',
      text: 'איזה מאמר מרגש ומעורר השראה! אני מרגיש שהמילים חודרות עמוק לנשמה ומזכירות לנו את החשיבות של חיבור פנימי. תודה רבה על השיתוף.',
      subject: 'מאמר מרגש',
      avatar: '/assets/img/avatar_yosi.jpg',
      replies: [],
      avatarError: false,
      email: 'yosi.cohen@example.com'
    },
    {
      id: 2,
      author: 'נועה לוי',
      date: '1 בינואר 2045',
      text: 'קראתי בדמעות בעיניים. יש כל כך הרבה אמת ויופי במסע הזה אל האני האמיתי. זה מחזק אותי לדעת שאני לא לבד בחיפוש אחר שלווה פנימית.',
      subject: 'חיזוק פנימי',
      avatar: '/assets/img/avatar_noa.jpg',
      replies: [
        {
          id: 3,
          author: 'דוד ישראלי',
          date: '1 בינואר 2045',
          text: 'התגובה שלך נגעה לליבי, נועה. גם אני חווה רגשות דומים. האפשרות לשרת את החברה מתוך אושר פנימי היא משהו שכולנו יכולים לשאוף אליו.',
          subject: 'תגובה מרגשת',
          avatar: '/assets/img/avatar_david.jpg',
          avatarError: false,
          email: 'david.israeli@example.com',
          replies: []
        }
      ],
      avatarError: false,
      email: 'noa.levi@example.com'
    },
    {
      id: 4,
      author: 'מאיה לוי',
      date: '22 באפריל 2024',
      text: 'הדברים נגעו לליבי. לפעמים אנחנו שוכחים להקשיב לעצמנו באמת, והדרך של הזן מזכירה לי כמה חשוב לעצור ולהתבונן פנימה. תודה על ההשראה.',
      subject: 'השראה',
      avatar: '/assets/img/avatar_maya.jpg',
      replies: [],
      avatarError: false,
      email: 'maya.levi@example.com'
    },
    {
      id: 5,
      author: 'ארז ברק',
      date: '22 באפריל 2024',
      text: 'המאמר הזה גרם לי להרגיש שאני לא לבד במסע לחיפוש משמעות. ההסבר על האני האמיתי והחיבור לחיי היום-יום ריגש אותי מאוד.',
      subject: 'חיפוש משמעות',
      avatar: '/assets/img/avatar_erez.jpg',
      replies: [],
      avatarError: false,
      email: 'erez.barak@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}
