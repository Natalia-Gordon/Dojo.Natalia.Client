import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

export type AuthDialogChoice = 'refresh' | 'logout';

@Injectable({
  providedIn: 'root'
})
export class AuthDialogService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private choiceSubject = new Subject<AuthDialogChoice>();
  
  public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();
  public choice$: Observable<AuthDialogChoice> = this.choiceSubject.asObservable();

  open(): Observable<AuthDialogChoice> {
    this.isOpenSubject.next(true);
    return this.choice$;
  }

  close(): void {
    this.isOpenSubject.next(false);
  }

  setChoice(choice: AuthDialogChoice): void {
    this.choiceSubject.next(choice);
    this.isOpenSubject.next(false);
  }

  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }
}
