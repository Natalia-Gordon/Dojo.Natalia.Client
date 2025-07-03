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
import { SenseiAboutComponent } from './sensei/about/about.component';
import { SenseiArticlesComponent } from './sensei/articles/articles.component';
import { SenseiArticlesZenComponent } from './sensei/articles/zen/zen.component';
import { SenseiTeamTaniaComponent } from './sensei/team/tania/tania.component';
import { SenseiTeamComponent } from './sensei/team/team.component';
import { SenseiArticlesNinjutsuComponent } from './sensei/articles/ninjutsu/ninjutsu.component';
import { SenseiArticlesZenIntroductionComponent } from './sensei/articles/zen/introduction/introduction.component';
import { ZenTermsComponent } from './sensei/articles/zen/terms/terms.component';
import { ZenTermsAnAtamanComponent } from './sensei/articles/zen/terms/an-ataman/an-ataman.component';
import { ZenTermsBuddhaComponent } from './sensei/articles/zen/terms/buddha/buddha.component';
import { ZenTermsBodhidahrmaComponent } from './sensei/articles/zen/terms/bodhidahrma/bodhidahrma.component';
import { ZenTermsBodhisatavaComponent } from './sensei/articles/zen/terms/bodhisatava/bodhisatava.component';
import { ZenTermsDojoComponent } from './sensei/articles/zen/terms/dojo/dojo.component';
import { ZenTermsZazenComponent } from './sensei/articles/zen/terms/zazen/zazen.component';
import { ZenTermsMenguComponent } from './sensei/articles/zen/terms/mengu/mengu.component';
import { ZenTermsZenkiComponent } from './sensei/articles/zen/terms/zenki/zenki.component';
import { ZenTermsSotoSenComponent } from './sensei/articles/zen/terms/soto-sen/soto-sen.component';
import { ZenTermsSatoriComponent } from './sensei/articles/zen/terms/satori/satori.component';
import { ZenTermsKinhinComponent } from './sensei/articles/zen/terms/kinhin/kinhin.component';
import { ZenTermsRandoriComponent } from './sensei/articles/zen/terms/randori/randori.component';
import { FukanZazengiComponent } from './sensei/articles/zen/fukan-zazengi/fukan-zazengi.component';
import { GenjoKoanComponent } from './sensei/articles/zen/genjo-koan/genjo-koan.component';
import { ZenkiComponent } from './sensei/articles/zen/zenki/zenki.component';

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
    {path: "sensei/about", component: SenseiAboutComponent},
    {path: "sensei/articles", component: SenseiArticlesComponent},
    {path: "sensei/articles/ninjutsu", component: SenseiArticlesNinjutsuComponent},
    {path: "sensei/articles/zen", component: SenseiArticlesZenComponent},
    {path: "sensei/articles/zen/terms", component: ZenTermsComponent},
    {path: "sensei/articles/zen/terms/an-ataman", component: ZenTermsAnAtamanComponent},
    {path: "sensei/articles/zen/terms/buddha", component: ZenTermsBuddhaComponent},
    {path: "sensei/articles/zen/terms/bodhidahrma", component: ZenTermsBodhidahrmaComponent},
    {path: "sensei/articles/zen/terms/bodhisatava", component: ZenTermsBodhisatavaComponent},
    {path: "sensei/articles/zen/terms/dojo", component: ZenTermsDojoComponent},
    {path: "sensei/articles/zen/terms/zazen", component: ZenTermsZazenComponent},
    {path: "sensei/articles/zen/terms/zenki", component: ZenTermsZenkiComponent},
    {path: "sensei/articles/zen/terms/mengu", component: ZenTermsMenguComponent},
    {path: "sensei/articles/zen/terms/soto-zen", component: ZenTermsSotoSenComponent},
    {path: "sensei/articles/zen/terms/sunyata", component: ZenTermsSotoSenComponent},
    {path: "sensei/articles/zen/terms/satori", component: ZenTermsSatoriComponent},
    {path: "sensei/articles/zen/terms/kinhin", component: ZenTermsKinhinComponent},
    {path: "sensei/articles/zen/terms/randori", component: ZenTermsRandoriComponent},
    {path: "sensei/articles/zen/terms/jijiyuzamai", component: ZenTermsRandoriComponent},
    {path: "sensei/articles/zen/introduction", component: SenseiArticlesZenIntroductionComponent},
    {path: "sensei/articles/zen/fukan-zazengi", component: FukanZazengiComponent},
    {path: "sensei/articles/zen/genjo-koan", component: GenjoKoanComponent},
    {path: "sensei/articles/zen/zenki", component: ZenkiComponent},
    {path: "sensei/team", component: SenseiTeamComponent},
    {path: "sensei/team/tania", component: SenseiTeamTaniaComponent}
];
