import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AddcommentComponent } from '../addcomment/addcomment.component';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [FormsModule, AddcommentComponent],
  templateUrl: './comment-item.component.html',
  styleUrl: './comment-item.component.css'
})
export class CommentItemComponent {
  @Input() comment: any;
  @Output() replyAdded = new EventEmitter<any>();

  showReplyForm: boolean = false;

  toggleReplyForm() {
    this.showReplyForm = !this.showReplyForm;
  }

  onReplyAdded(newReply: any) {
    if (!this.comment.replies) {
      this.comment.replies = [];
    }
    this.comment.replies.push(newReply);
    this.showReplyForm = false; // Hide the form after adding a reply
    this.replyAdded.emit(newReply); // Emit the event for the parent component if needed
  }
}
