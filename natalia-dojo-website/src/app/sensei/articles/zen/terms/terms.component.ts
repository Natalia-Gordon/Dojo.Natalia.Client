import { Component } from '@angular/core';
import { ZenSidebarComponent } from "../sidebar/sidebar.component";
import { CommentsComponent } from "../../../../blog/articles/comments/comments.component";
import { SharedHeroComponent } from "../../../../shared/components/hero/hero.component";
import { ZenTermsAnAtamanComponent } from "./an-ataman/an-ataman.component";
import { ZenTermsIgyoComponent } from "./igyo/igyo.component";
import { ZenTermsEisaiComponent } from "./eisai/eisai.component";
import { ZenTermsEngakujiComponent } from "./engakuji/engakuji.component";
import { ZenTermsAsangaComponent } from "./asanga/asanga.component";
import { ZenTermsBuddhaComponent } from "./buddha/buddha.component";
import { ZenTermsBodhidahrmaComponent } from "./bodhidahrma/bodhidahrma.component";
import { ZenTermsBodhisatavaComponent } from "./bodhisatava/bodhisatava.component";
import { ZenTermsButsudenComponent } from "./butsuden/butsuden.component";
import { ZenTermsGazenIchimiComponent } from "./gazen-ichimi/gazen-ichimi.component";
import { ZenTermsGyochaShikiComponent } from "./gyocha-shiki/gyocha-shiki.component";
import { ZenTermsGenkanComponent } from "./genkan/genkan.component";
import { ZenTermsDojoComponent } from "./dojo/dojo.component";
import { ZenTermsHabokuComponent } from "./haboku/haboku.component";
import { ZenTermsHattoComponent } from "./hatto/hatto.component";
import { ZenTermsHojoComponent } from "./hojo/hojo.component";
import { ZenTermsHaikuComponent } from "./haiku/haiku.component";
import { ZenTermsZazenComponent } from "./zazen/zazen.component";
import { ZenTermsZendoComponent } from "./zendo/zendo.component";
import { ZenTermsZenkiComponent } from "./zenki/zenki.component";

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [ZenSidebarComponent, CommentsComponent, SharedHeroComponent, ZenTermsAnAtamanComponent, ZenTermsIgyoComponent, ZenTermsEisaiComponent, ZenTermsEngakujiComponent, ZenTermsAsangaComponent, ZenTermsBuddhaComponent, ZenTermsBodhidahrmaComponent, ZenTermsBodhisatavaComponent, ZenTermsButsudenComponent, ZenTermsGazenIchimiComponent, ZenTermsGyochaShikiComponent, ZenTermsGenkanComponent, ZenTermsDojoComponent, ZenTermsHabokuComponent, ZenTermsHattoComponent, ZenTermsHojoComponent, ZenTermsHaikuComponent, ZenTermsZazenComponent, ZenTermsZendoComponent, ZenTermsZenkiComponent],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css'
})
export class ZenTermsComponent {

}
