import { Component } from '@angular/core';
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";
import { ZenSidebarComponent } from "../sidebar/sidebar.component";
import { AddcommentComponent } from "../../../../blog/articles/addcomment/addcomment.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fukan-zazengi',
  standalone: true,
  imports: [AddcommentComponent, ZenSidebarComponent, SharedHeroComponent, CommonModule],
  templateUrl: './fukan-zazengi.component.html',
  styleUrl: './fukan-zazengi.component.css'
})
export class FukanZazengiComponent {

}
