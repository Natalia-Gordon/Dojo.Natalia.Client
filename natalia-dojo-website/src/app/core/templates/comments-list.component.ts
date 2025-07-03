import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Comment {
  id: number;
  author: string;
  date: string;
  text: string;
  avatar: string;
  avatarError: boolean;
  email: string;
  replies: Comment[];
}

@Component({
  selector: 'app-comments-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comments-list.component.html',
  styleUrl: './comments-list.component.css'
})
export class CommentsListComponent {
  @Input() comments: Comment[] = [];
} 