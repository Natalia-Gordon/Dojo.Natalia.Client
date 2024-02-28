import { Component } from '@angular/core';
import * as jQuery from "jquery";
import { AboutComponent } from "../about/about.component";
import { WorkoutsComponent } from "../workouts/workouts.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [AboutComponent, WorkoutsComponent]
})
export class HomeComponent {

}
