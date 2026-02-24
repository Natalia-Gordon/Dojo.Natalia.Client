import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-terms-of-use',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './terms-of-use.component.html',
  styleUrl: './terms-of-use.component.css',
})
export class TermsOfUseComponent {
  currentYear = new Date().getFullYear();

  constructor(private title: Title, private meta: Meta) {
    this.title.setTitle("תנאי שימוש | דוג'ו נטליה");
    this.meta.updateTag({
      name: 'description',
      content: "תנאי השימוש באתר דוג'ו נטליה – בוג'ינקאן נינג'וטסו.",
    });
  }
}
