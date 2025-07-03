import { Component } from '@angular/core';
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";
import { ZenSidebarComponent } from "../sidebar/sidebar.component";
import { AddcommentComponent } from "../../../../blog/articles/addcomment/addcomment.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-genjo-koan',
  standalone: true,
  imports: [AddcommentComponent, ZenSidebarComponent, SharedHeroComponent, CommonModule],
  templateUrl: './genjo-koan.component.html',
  styleUrl: './genjo-koan.component.css'
})
export class GenjoKoanComponent {

}
