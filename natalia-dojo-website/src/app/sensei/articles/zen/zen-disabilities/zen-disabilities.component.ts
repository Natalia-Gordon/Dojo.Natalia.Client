import { Component } from '@angular/core';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';
import { AddcommentComponent } from '../../../../core/templates/addcomment/addcomment.component';

@Component({
  selector: 'app-zen-disabilities',
  standalone: true,
  imports: [SenseiZenHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent, AddcommentComponent],
  templateUrl: './zen-disabilities.component.html',
  styleUrl: './zen-disabilities.component.css'
})
export class ZenDisabilitiesComponent {
  comments: Comment[] = [
    {
      id: 1,
      author: 'רונן לוי',
      date: '28 בדצמבר 2024',
      text: 'כאדם עם מוגבלות, המאמר הזה נתן לי תקווה אמיתית. הרעיון שהידיים והרגליים קיימים בתוך הנפש - זה כל כך יפה ומעצים. אני מרגיש שהזן באמת פתוח לכולם, בלי שום אפליה. תודה על המסר החשוב הזה.',
      subject: 'תקווה והעצמה',
      avatar: '/assets/img/avatar_erez.jpg',
      replies: [],
      avatarError: false,
      email: 'ronen.levi@example.com'
    },
    {
      id: 2,
      author: 'יעל כהן',
      date: '29 בדצמבר 2024',
      text: 'החלק על הגאמן - הסבלנות כלפי עצמך - זה משהו שכולנו צריכים, אבל במיוחד אנשים עם מוגבלויות. המאמר מסביר בצורה יפה איך הזן יכול לעזור להתגבר על תסכולים ולמצוא כוח פנימי. זה מעורר השראה.',
      subject: 'גאמן וסבלנות',
      avatar: '/assets/img/avatar_maya.jpg',
      replies: [],
      avatarError: false,
      email: 'yael.cohen@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}

