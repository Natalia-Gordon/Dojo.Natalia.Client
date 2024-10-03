import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { response } from 'express';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private watsappUrl = 'https://api.whatsapp.com/send';

  constructor(private http: HttpClient, @Inject(DOCUMENT) private window: Document) { }

  SendMessageToWatsapp(phone: string, text: string){
    console.log("Before Send");
    //this.http.get("https://api.whatsapp.com/send?phone=+972547007906&text=רוצה להצטרף לאימון נינג&#39;וטסו");
    //console.log("After Send");
    var fullUrl = this.watsappUrl + "?phone=" + phone + "&text=" + text;
    console.log(fullUrl);
    //this.http.get(fullUrl);
    //this.document.location.href = fullUrl;
    (window as any).open(fullUrl, "_blank")
    console.log("After Send");
  }
}
