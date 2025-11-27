import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ZenItem {
  label: string;
  path: string;
}

@Component({
  selector: 'app-zen-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class ZenSidebarComponent {
  searchTerm = '';

  // Example articles
  zenArticles: ZenItem[] = [
    { label: "מה הוא זן?", path: 'sensei/articles/zen/introduction' },
    { label: "הנחיות לישיבה בזה-זן", path: 'sensei/articles/zen/fukan-zazengi' },
    { label: "הקואן בחיי היום יום (גֶנְג'וֹקוֹאָן)", path: 'sensei/articles/zen/genjo-koan' },
    { label: "פילוסופיה של תפקוד מלא (זנקי)", path: 'sensei/articles/zen/zenki' },
    { label: "דברי המורה דני וקסמן", path: 'sensei/articles/zen/teacher-message' },
    { label: "זן וג'ודו", path: 'sensei/articles/zen/zenandjodo' },
    { label: "הזן היום", path: 'sensei/articles/zen/zen-today' },
    { label: "זן בחיי יומיום: גישת הסוֹטוֹ זֵן - תמצית שיטתי", path: 'sensei/articles/zen/zen-daily-life' },
    { label: "להתאמן כשחיים, לחיותתאמנים", path: 'sensei/articles/zen/practice-when-living' },
    { label: "הופעת הקואן בחיי היום יום", path: 'sensei/articles/zen/koan-daily-life' },
    { label: "חשיבות הנפש האוניברסלית", path: 'sensei/articles/zen/universal-mind' },
    { label: "לֵט-גוֹ בזֵן ובג'וּדוֹ", path: 'sensei/articles/zen/let-go-zen-judo' },
    { label: "יחסי מורה תלמיד בעידן המודרני", path: 'sensei/articles/zen/teacher-student-relationship' },
    { label: "זֵן ומוגבלויות", path: 'sensei/articles/zen/zen-disabilities' },
    { label: "על חשיבות חיי האדם", path: 'sensei/articles/zen/human-life-importance' }
  ];

  // Example terms
  zenTerms: ZenItem[] = [
    { label: 'אן-אטאמן', path: 'sensei/articles/zen/terms/an-ataman' },
    { label: 'בודהה', path: 'sensei/articles/zen/terms/buddha' },
    { label: 'בודהידרמה', path: 'sensei/articles/zen/terms/bodhidahrma' },
    { label: 'בודהיסטווה', path: 'sensei/articles/zen/terms/bodhisatava' },
    { label: "דוג'ו", path: 'sensei/articles/zen/terms/dojo' },
    { label: 'זה-זן', path: 'sensei/articles/zen/terms/zazen' },
    { label: 'זנקי', path: 'sensei/articles/zen/terms/zenki' },
    { label: "מנג'ו", path: 'sensei/articles/zen/terms/mengu' },
    { label: 'סוטו-זן', path: 'sensei/articles/zen/terms/soto-zen' },
    { label: 'סוניאטה', path: 'sensei/articles/zen/terms/sunyata' },
    { label: 'סטורי', path: 'sensei/articles/zen/terms/satori' },
    { label: 'קינהין', path: 'sensei/articles/zen/terms/kinhin' },
    { label: 'רנדורי', path: 'sensei/articles/zen/terms/randori' },
    { label: "גי'גי'ו-זהמאיי", path: 'sensei/articles/zen/terms/jijiyuzamai' }
  ];

  constructor(private router: Router) {}

  get filteredArticles() {
    return this.zenArticles.filter(item => this.searchTerm && item.label.includes(this.searchTerm));
  }

  get filteredTerms() {
    return this.zenTerms.filter(item => this.searchTerm && item.label.includes(this.searchTerm));
  }

  onSearchTermChange(value: string) {
    this.searchTerm = value;
  }

  navigateTo(path: string) {
    this.router.navigateByUrl('/' + path);
    this.searchTerm = '';
  }
}
