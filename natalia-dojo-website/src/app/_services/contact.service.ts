import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private watsappUrl = 'https://api.whatsapp.com/send';

  constructor(
    private http: HttpClient, 
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  SendMessageToWatsapp(phone: string, text: string){
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('SendMessageToWatsapp called during SSR - skipping');
      return;
    }
    
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
