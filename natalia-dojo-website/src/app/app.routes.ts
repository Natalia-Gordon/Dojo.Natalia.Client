import { Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { ContactComponent } from './contact/contact.component';
import { WorkoutsComponent } from './workouts/workouts.component';
import { TeamComponent } from './team/team.component';
import { BlogComponent } from './blog/blog.component';
import { TestimonialComponent } from './testimonial/testimonial.component';
import { ArticlesComponent } from './blog/articles/articles.component';
import { Zen1Component } from './blog/articles/zen/zen-1/zen-1.component';

export const routes: Routes = [
    {path: "", component: HomeComponent},
    {path: "home", component: HomeComponent},
    {path: "about", component: AboutComponent},
    {path: "contact", component: ContactComponent},
    {path: "workouts", component: WorkoutsComponent},
    {path: "team", component: TeamComponent},
    {path: "blog", component: BlogComponent},
    {path: "testimonial", component: TestimonialComponent},
    {path: "articles", component: ArticlesComponent},
    {path: "articles/zen/1", component: Zen1Component}
];
