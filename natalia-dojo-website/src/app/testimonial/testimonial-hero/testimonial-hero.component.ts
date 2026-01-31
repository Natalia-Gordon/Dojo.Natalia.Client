import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-testimonial-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './testimonial-hero.component.html',
  styleUrl: './testimonial-hero.component.css'
})
export class TestimonialHeroComponent { }
