import { Component, Input, OnInit } from '@angular/core';
import { SharedContactComponent } from "../../shared/components/contact/contact.component";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SharedContactComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class SenseiAboutComponent implements OnInit {
  constructor(){
  }

  ngOnInit() {
  }
}
