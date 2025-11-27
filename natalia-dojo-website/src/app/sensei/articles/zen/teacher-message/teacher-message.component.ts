import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SenseiZenHeroComponent } from '../hero/sensei-zen-hero.component';
import { ZenSidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-teacher-message',
  standalone: true,
  imports: [CommonModule, SenseiZenHeroComponent, ZenSidebarComponent],
  templateUrl: './teacher-message.component.html',
  styleUrl: './teacher-message.component.css'
})
export class TeacherMessageComponent {
}
