import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { AddcommentComponent } from '../addcomment/addcomment.component';

export interface Comment {
  id: number;
  author: string;
  date: string;
  subject?: string;
  text: string;
  avatar: string;
  avatarError: boolean;
  email: string;
  replies: Comment[];
}

@Component({
  selector: 'app-comments-list',
  standalone: true,
  imports: [CommonModule, CommentItemComponent, AddcommentComponent],
  templateUrl: './comments-list.component.html',
  styleUrl: './comments-list.component.css'
})
export class CommentsListComponent {
  @Input() comments: Comment[] = [];

  onCommentAdded(newComment: any) {
    this.comments.push(newComment);
  }
} 