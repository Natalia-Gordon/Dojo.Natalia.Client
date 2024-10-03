import { Component } from '@angular/core';
import { SharedContactComponent } from "../shared/components/contact/contact.component";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ContactComponent, SharedContactComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {

}
