import { Component } from '@angular/core';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';
import { AddcommentComponent } from '../../../../core/templates/addcomment/addcomment.component';

@Component({
  selector: 'app-universal-mind',
  standalone: true,
  imports: [SenseiZenHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent, AddcommentComponent, DatePipe],
  templateUrl: './universal-mind.component.html',
  styleUrl: './universal-mind.component.css'
})
export class UniversalMindComponent {
  articleDate = new Date('2025-11-27');
  
  comments: Comment[] = [
    {
      id: 1,
      author: 'ליאור בן דוד',
      date: '22 בדצמבר 2024',
      text: 'המאמר הזה מדבר ישירות לליבי. הרעיון של נפש אוניברסלית - אהבה ללא אפליה - זה מה שהעולם צריך היום. כשאני מתרגל זה-זן, אני מרגיש את החיבור הזה לכל היצורים. זה יפה ומרגש.',
      subject: 'אהבה ללא גבולות',
      avatar: '/assets/img/avatar_erez.jpg',
      replies: [],
      avatarError: false,
      email: 'lior.bendavid@example.com'
    },
    {
      id: 2,
      author: 'נועה גרין',
      date: '23 בדצמבר 2024',
      text: 'החלק על כך שכל אחד יכול להגיע לנפש האוניברסלית ללא קשר לנסיבות חייו - זה כל כך מעודד. זה מראה שהזן באמת שוויוני ופתוח לכולם, ללא הבדלים. המסר הזה חשוב במיוחד בעולם שלנו ומזכיר לנו שכולנו שווים בדרך.',
      subject: 'שוויון בדרך',
      avatar: '/assets/img/avatar_noa.jpg',
      replies: [],
      avatarError: false,
      email: 'noa.green@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}

