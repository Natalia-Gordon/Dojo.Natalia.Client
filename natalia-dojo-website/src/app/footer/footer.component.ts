import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  onSave() {
    console.log(' saved!');
  }

  onSubmit() {
    console.log('Form submitted!');
    // Add your form processing logic here
  }
}
