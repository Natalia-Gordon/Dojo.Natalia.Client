import { Component } from '@angular/core';
import { SidebarComponent } from "../../../../blog/sidebar/sidebar.component";
import { ZenheroComponent } from "../../../../blog/articles/zen/hero/hero.component";
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";
import { ZenSidebarComponent } from "../sidebar/sidebar.component";
import { CommonModule } from '@angular/common';
import { CommentsListComponent } from 'app/core/templates/comments-list.component';
import { AddcommentComponent } from "../../../../blog/articles/addcomment/addcomment.component";

@Component({
  selector: 'app-introduction',
  standalone: true,
  imports: [AddcommentComponent, SharedHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.css'
})
export class SenseiArticlesZenIntroductionComponent {
  comments = [
    {
      id: 1,
      author: 'יוסי כהן',
      date: '1 בינואר 2045',
      text: 'איזה מאמר מרגש ומעורר השראה! אני מרגיש שהמילים חודרות עמוק לנשמה ומזכירות לנו את החשיבות של חיבור פנימי. תודה רבה על השיתוף.',
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
      avatar: '/assets/img/avatar_noa.jpg',
      replies: [
        {
          id: 3,
          author: 'דוד ישראלי',
          date: '1 בינואר 2045',
          text: 'התגובה שלך נגעה לליבי, נועה. גם אני חווה רגשות דומים. האפשרות לשרת את החברה מתוך אושר פנימי היא משהו שכולנו יכולים לשאוף אליו.',
          avatar: '/assets/img/avatar_david.jpg',
          avatarError: false,
          email: 'david.israeli@example.com'
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
      avatar: '/assets/img/avatar_erez.jpg',
      replies: [],
      avatarError: false,
      email: 'erez.barak@example.com'
    }
  ];
}
