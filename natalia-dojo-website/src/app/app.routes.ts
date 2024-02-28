import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { ContactComponent } from './contact/contact.component';
import { WorkoutsComponent } from './workouts/workouts.component';
import { TeamComponent } from './team/team.component';

export const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "about", component: AboutComponent},
    {path: "contact", component: ContactComponent},
    {path: "workouts", component: WorkoutsComponent},
    {path: "team", component: TeamComponent}
];
