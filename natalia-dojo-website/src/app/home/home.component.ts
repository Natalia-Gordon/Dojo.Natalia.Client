import { Component } from '@angular/core';
import * as jQuery from "jquery";
import { AboutComponent } from "../about/about.component";
import { WorkoutsComponent } from "../workouts/workouts.component";
import { TeamComponent } from "../team/team.component";

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
    imports: [AboutComponent, WorkoutsComponent, TeamComponent]
})
export class HomeComponent {

}
