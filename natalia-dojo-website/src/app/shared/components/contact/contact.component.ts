import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; 
import { ContactService } from '../../../_services/contact.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class SharedContactComponent implements OnInit {
  @Input('phone') phone: string = '';

  public FormData = new FormGroup({
      Fullname: new FormControl('', [Validators.required]),
      Email: new FormControl('', [Validators.required, Validators.email]),
      Subject: new FormControl('', [Validators.required]),
      Message: new FormControl('', [Validators.required])
  });

  constructor(private builder: FormBuilder, private contactApi: ContactService) { }

  ngOnInit() {
    this.FormData = this.builder.group({
      Fullname: new FormControl('', [Validators.required]),
      Email: new FormControl('', [Validators.required, Validators.email]),
      Subject: new FormControl('', [Validators.required]),
      Message: new FormControl('', [Validators.required])
      })
  }

  onSubmit(FormData : any) {
    var myMessage = "Hello, my name is " + FormData.Fullname + 
    " I am contacting you about " + FormData.Subject + 
    " details message " + FormData.Message + " \n" +
    "My contact email " + FormData.Email;
    this.contactApi.SendMessageToWatsapp(this.phone, myMessage);
  }
}
