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
import { SenseiAboutComponent } from './sensei/about/about.component';
import { SenseiArticlesComponent } from './sensei/articles/articles.component';
import { SenseiArticlesZenComponent } from './sensei/articles/zen/zen.component';
import { SenseiTeamTaniaComponent } from './sensei/team/tania/tania.component';
import { SenseiTeamComponent } from './sensei/team/team.component';
import { SenseiArticlesNinjutsuComponent } from './sensei/articles/ninjutsu/ninjutsu.component';
import { SenseiArticlesZenIntroductionComponent } from './sensei/articles/zen/introduction/introduction.component';

export const routes: Routes = [
    {path: "", redirectTo: "home", pathMatch: "full"},
    {path: "home", component: HomeComponent},
    {path: "about", component: AboutComponent},
    {path: "contact", component: ContactComponent},
    {path: "workouts", component: WorkoutsComponent},
    {path: "team", component: TeamComponent},
    {path: "blog", component: BlogComponent},
    {path: "testimonial", component: TestimonialComponent},
    {path: "articles", component: ArticlesComponent},
    {path: "articles/zen/1", component: Zen1Component},
    {path: "sensei/about", component: SenseiAboutComponent},
    {path: "sensei/articles", component: SenseiArticlesComponent},
    {path: "sensei/articles/ninjutsu", component: SenseiArticlesNinjutsuComponent},
    {path: "sensei/articles/zen", component: SenseiArticlesZenComponent},
    {path: "sensei/articles/zen/introduction", component: SenseiArticlesZenIntroductionComponent},
    {path: "sensei/team", component: SenseiTeamComponent},
    {path: "sensei/team/tania", component: SenseiTeamTaniaComponent}
];
