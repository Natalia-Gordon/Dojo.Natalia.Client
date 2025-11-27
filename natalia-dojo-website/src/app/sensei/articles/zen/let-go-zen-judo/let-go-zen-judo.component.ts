import { Component } from '@angular/core';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';
import { AddcommentComponent } from '../../../../core/templates/addcomment/addcomment.component';

@Component({
  selector: 'app-let-go-zen-judo',
  standalone: true,
  imports: [SenseiZenHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent, AddcommentComponent],
  templateUrl: './let-go-zen-judo.component.html',
  styleUrl: './let-go-zen-judo.component.css'
})
export class LetGoZenJudoComponent {
  comments: Comment[] = [
    {
      id: 1,
      author: 'יואב כהן',
      date: '24 בדצמבר 2024',
      text: 'כמתרגל ג\'ודו, המאמר הזה חיבר לי את הנקודות! עכשיו אני מבין למה המורה שלי מדגיש כל כך את הלט-גו. זה לא רק טכניקה - זה דרך חיים. כשאני משחרר, הכוח הקוסמי באמת נכנס. זה מדהים!',
      subject: 'לט-גו בג\'ודו',
      avatar: '/assets/img/avatar_david.jpg',
      replies: [],
      avatarError: false,
      email: 'yoav.cohen@example.com'
    },
    {
      id: 2,
      author: 'מיכל רוזן',
      date: '25 בדצמבר 2024',
      text: 'החיבור בין זן לג\'ודו כל כך יפה. "על ידי זה שאנחנו זורקים הכל פנימה, אנחנו עוזבים הכל" - זה משפט שמלווה אותי גם באימונים וגם בחיים. המאמר הזה עוזר לי להבין את העומק של התרגול.',
      subject: 'חיבור עמוק',
      avatar: '/assets/img/avatar_maya.jpg',
      replies: [],
      avatarError: false,
      email: 'michal.rozen@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}

