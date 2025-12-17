import { Component } from '@angular/core';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { CommentsListComponent, Comment } from '../../../../core/templates/comments-list/comments-list.component';
import { AddcommentComponent } from '../../../../core/templates/addcomment/addcomment.component';
import { AudioPlayerComponent } from '../../../../core/templates/audio-player/audio-player.component';

@Component({
  selector: 'app-zen-today',
  standalone: true,
  imports: [SenseiZenHeroComponent, ZenSidebarComponent, CommonModule, CommentsListComponent, AddcommentComponent, AudioPlayerComponent],
  templateUrl: './zen-today.component.html',
  styleUrl: './zen-today.component.css'
})
export class ZenTodayComponent {
  // Audio file path - place your audio file at: src/assets/audio/zen-today-dani-waxman.mp3
  // Supported formats: MP3 (recommended), OGG, WAV
  audioSrc = 'assets/audio/zen-today-dani-waxman.mp3';

  comments: Comment[] = [
    {
      id: 1,
      author: 'שרה אברהם',
      date: '15 בדצמבר 2024',
      text: 'המאמר הזה מדגיש בצורה יפה את הרלוונטיות של הזן לעולם המודרני. במיוחד נגע לליבי החלק על אנשים עם מוגבלויות - זה מראה שהזן באמת פתוח לכולם. התיאור של דוגן ומסונאגה מעורר השראה.',
      subject: 'זן לכל אדם',
      avatar: '/assets/img/avatar_yosi.jpg',
      replies: [],
      avatarError: false,
      email: 'sara.avraham@example.com'
    },
    {
      id: 2,
      author: 'רונן כהן',
      date: '16 בדצמבר 2024',
      text: 'הרעיון של "השמחה הבאה מן הפנים" - הג\'יו-זמאיי - זה משהו שאני מרגיש כשאני יושב זה-זן. המאמר עוזר לי להבין את המשמעות העמוקה של התרגול. תודה על ההבהרה.',
      subject: 'השמחה הפנימית',
      avatar: '/assets/img/avatar_noa.jpg',
      replies: [],
      avatarError: false,
      email: 'ronen.cohen@example.com'
    }
  ];

  addNewComment(comment: Comment) {
    this.comments.push(comment);
  }
}

