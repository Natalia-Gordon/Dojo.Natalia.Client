import { Component } from '@angular/core';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';
import { AddcommentComponent } from '../../../../core/templates/addcomment/addcomment.component';

@Component({
  selector: 'app-human-life-importance',
  standalone: true,
  imports: [SenseiZenHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent, AddcommentComponent],
  templateUrl: './human-life-importance.component.html',
  styleUrl: './human-life-importance.component.css'
})
export class HumanLifeImportanceComponent {
  comments: Comment[] = [
    {
      id: 1,
      author: 'דוד ישראלי',
      date: '30 בדצמבר 2024',
      text: 'המאמר הזה מדבר על ערך החיים בצורה כל כך חזקה. "רק לאלוהים מותר להרוג אדם" - זה מסר כל כך חשוב בעולם שלנו. המאמר מזכיר לנו את הקדושה של כל חיים ואת האחריות שלנו לכבד אותם.',
      subject: 'קדושת החיים',
      avatar: '/assets/img/avatar_david.jpg',
      replies: [],
      avatarError: false,
      email: 'david.israeli@example.com'
    },
    {
      id: 2,
      author: 'מיכל רוזן',
      date: '31 בדצמבר 2024',
      text: 'החלק על "אין זמן לבזבז" נגע לליבי. המאמר מזכיר לנו לנצל כל רגע, להתאמן כל יום, לא לבזבז יום אחד. זה מסר חזק שמעורר אותי לפעולה. גם החלק על המשכיות החיים - לא להתאבד, להמשיך - זה חשוב מאוד.',
      subject: 'ערך הזמן',
      avatar: '/assets/img/avatar_noa.jpg',
      replies: [],
      avatarError: false,
      email: 'michal.rozen@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}

