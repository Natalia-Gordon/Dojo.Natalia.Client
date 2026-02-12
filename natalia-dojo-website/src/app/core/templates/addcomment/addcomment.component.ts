import { Component, Output, EventEmitter } from '@angular/core';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-addcomment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './addcomment.component.html',
  styleUrl: './addcomment.component.css'
})
export class AddcommentComponent {
  @Output() newCommentAdded = new EventEmitter<any>();

  newComment = {
    author: '',
    email: '',
    subject: '',
    text: ''
  };

  showSuccessMessage: boolean = false;

  submitComment() {
    // For now, generate a simple ID. In a real app, this would come from a backend.
    const commentId = Math.floor(Math.random() * 1000000);
    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('he-IL', options).format(currentDate);

    const commentToAdd = {
      id: commentId,
      author: this.newComment.author || 'אנונימי',
      date: formattedDate,
      subject: this.newComment.subject,
      text: this.newComment.text,
      avatar: '/assets/img/default-avatar.jpg', // Placeholder avatar
      avatarError: false,
      email: this.newComment.email,
      replies: []
    };

    this.newCommentAdded.emit(commentToAdd);

    // Show success message
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000); // Hide after 5 seconds

    // Reset form fields
    this.newComment = {
      author: '',
      email: '',
      subject: '',
      text: ''
    };
  }
}
