import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type LoginModalTab = 'login' | 'register';

@Injectable({
  providedIn: 'root'
})
export class LoginModalService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();
  private activeTabSubject = new BehaviorSubject<LoginModalTab>('login');
  public activeTab$: Observable<LoginModalTab> = this.activeTabSubject.asObservable();

  open(tab: LoginModalTab = 'login'): void {
    this.activeTabSubject.next(tab);
    this.isOpenSubject.next(true);
  }

  openRegister(): void {
    this.open('register');
  }

  close(): void {
    this.isOpenSubject.next(false);
  }

  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }

  get activeTab(): LoginModalTab {
    return this.activeTabSubject.value;
  }
}
