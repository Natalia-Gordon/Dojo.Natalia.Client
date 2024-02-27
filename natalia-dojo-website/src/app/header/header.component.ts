import { Component, OnInit } from '@angular/core';
import { NavComponent } from "./nav/nav.component";

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    imports: [NavComponent]
})
export class HeaderComponent{

}
