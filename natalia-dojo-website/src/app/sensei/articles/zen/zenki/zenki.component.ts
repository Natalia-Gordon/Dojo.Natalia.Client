import { Component } from '@angular/core';
import { ZenSidebarComponent } from "../sidebar/sidebar.component";
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";
import { AddcommentComponent } from "../../../../blog/articles/addcomment/addcomment.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zenki',
  standalone: true,
  imports: [AddcommentComponent, ZenSidebarComponent, SharedHeroComponent, CommonModule],
  templateUrl: './zenki.component.html',
  styleUrl: './zenki.component.css'
})
export class ZenkiComponent {

}
