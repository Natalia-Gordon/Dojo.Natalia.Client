import { Component, OnInit } from '@angular/core';
import { SharedContactComponent } from "../shared/components/contact/contact.component";
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SharedContactComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  constructor(private title: Title, private meta: Meta) {}
  ngOnInit(): void {
    this.title.setTitle('צור קשר | דוג׳ו נטליה');
    this.meta.updateTag({
      name: 'description',
      content: 'צרו קשר עם דוג׳ו נטליה לקבלת פרטים על אימונים, הצטרפות וקביעת תקשורת אישית.'
    });
  }
}
