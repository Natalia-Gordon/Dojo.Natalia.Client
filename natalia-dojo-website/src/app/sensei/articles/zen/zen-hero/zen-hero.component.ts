import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-zen-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './zen-hero.component.html',
  styleUrl: './zen-hero.component.css'
})
export class ZenHeroComponent { }
