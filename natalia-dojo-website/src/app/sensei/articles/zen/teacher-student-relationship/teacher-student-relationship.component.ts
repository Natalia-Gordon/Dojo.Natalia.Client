import { Component } from '@angular/core';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';
import { AddcommentComponent } from '../../../../core/templates/addcomment/addcomment.component';

@Component({
  selector: 'app-teacher-student-relationship',
  standalone: true,
  imports: [SenseiZenHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent, AddcommentComponent, DatePipe],
  templateUrl: './teacher-student-relationship.component.html',
  styleUrl: './teacher-student-relationship.component.css'
})
export class TeacherStudentRelationshipComponent {
  articleDate = new Date('2025-11-27');
  
  comments: Comment[] = [
    {
      id: 1,
      author: 'דני רוזן',
      date: '26 בדצמבר 2024',
      text: 'המאמר הזה מתאר בדיוק את הקשר שיש לי עם המורה שלי. "חייהם מתערבבים ביחד וצומחים קדימה" - זה כל כך נכון. המורה לא רק מלמד, הוא נותן אהבה של בודהה. זה משהו שלא ניתן להחליף.',
      subject: 'קשר מיוחד',
      avatar: '/assets/img/avatar_yosi.jpg',
      replies: [],
      avatarError: false,
      email: 'danny.rozen@example.com'
    },
    {
      id: 2,
      author: 'שרה כהן',
      date: '27 בדצמבר 2024',
      text: 'החלק על הדוג\'ו נגע לליבי. "אין בו תאונות דרכים, אין מלחמות, יש ריכוז" - זה בדיוק מה שאני מרגישה כשאני נכנסת לדוג\'ו. זה מקום מקודש של התפתחות. המאמר מסביר בצורה יפה את החשיבות של המורה והמקום.',
      subject: 'הדוג\'ו כמקום מקודש',
      avatar: '/assets/img/avatar_noa.jpg',
      replies: [],
      avatarError: false,
      email: 'sara.cohen@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}

