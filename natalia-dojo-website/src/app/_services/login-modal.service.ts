import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

export type LoginModalTab = 'login' | 'register';

export interface UserToEdit {
  id: number;
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  role?: string | null;
  currentRankId?: number | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  isActive?: boolean;
}

export interface OpenOptions {
  /** Pre-fill username for reconnect flow */
  prefillUsername?: string | null;
  /** Open register tab in edit mode for this user */
  userToEdit?: UserToEdit | null;
}

@Injectable({
  providedIn: 'root'
})
export class LoginModalService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();
  private activeTabSubject = new BehaviorSubject<LoginModalTab>('login');
  public activeTab$: Observable<LoginModalTab> = this.activeTabSubject.asObservable();
  private prefillUsernameSubject = new BehaviorSubject<string | null>(null);
  private userToEditSubject = new BehaviorSubject<UserToEdit | null>(null);
  public userToEdit$ = this.userToEditSubject.asObservable();
  private reconnectSuccessSubject = new Subject<void>();
  /** Emits when user successfully logs in from reconnect flow (401/403 recovery) */
  public reconnectSuccess$: Observable<void> = this.reconnectSuccessSubject.asObservable();

  open(tab: LoginModalTab = 'login', options?: OpenOptions): void {
    this.activeTabSubject.next(tab);
    if (options?.prefillUsername != null) {
      this.prefillUsernameSubject.next(String(options.prefillUsername).trim() || null);
    } else {
      this.prefillUsernameSubject.next(null);
    }
    this.userToEditSubject.next(options?.userToEdit ?? null);
    this.isOpenSubject.next(true);
  }

  /** Open login tab with username prefilled (for reconnect after 401/403) */
  openForReconnect(username: string | null | undefined): void {
    this.open('login', { prefillUsername: username ?? null });
  }

  get prefillUsername(): string | null {
    return this.prefillUsernameSubject.value;
  }

  clearPrefillUsername(): void {
    this.prefillUsernameSubject.next(null);
  }

  /** Call when user successfully logs in from reconnect flow */
  notifyReconnectSuccess(): void {
    this.reconnectSuccessSubject.next();
  }

  openRegister(): void {
    this.open('register');
  }

  /** Open register tab as popup to edit an existing user */
  openRegisterForEditUser(user: UserToEdit): void {
    this.open('register', { userToEdit: user });
  }

  get userToEdit(): UserToEdit | null {
    return this.userToEditSubject.value;
  }

  clearUserToEdit(): void {
    this.userToEditSubject.next(null);
  }

  close(): void {
    this.isOpenSubject.next(false);
    this.userToEditSubject.next(null);
  }

  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }

  get activeTab(): LoginModalTab {
    return this.activeTabSubject.value;
  }
}
