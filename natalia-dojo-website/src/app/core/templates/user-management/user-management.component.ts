import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService, User, UserInfo } from '../../../_services/auth.service';
import { Rank, RanksService } from '../../../_services/ranks.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  ranks: Rank[] = [];
  isLoading = false;
  errorMessage = '';
  isRanksLoading = false;
  ranksError = '';
  isAdmin = false;
  userInfo: UserInfo | null = null;
  sortField:
    | 'firstName'
    | 'lastName'
    | 'role'
    | 'joinDate'
    | 'lastLoginAt'
    | 'currentRank'
    | 'level'
    | 'isActive'
    | 'dateOfBirth'
    | 'username'
    | 'isEmailVerified'
    | 'id' = 'username';
  sortDirection: 'asc' | 'desc' = 'asc';

  /** Popup: full-size profile image URL when open, null when closed */
  popupImageSrc: string | null = null;

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;
  private usersRefreshSubscription?: Subscription;
  private readonly nameCollator = new Intl.Collator(['he', 'en'], {
    sensitivity: 'base',
    numeric: true
  });
  private rankNameById = new Map<number, string>();

  constructor(
    private authService: AuthService,
    private ranksService: RanksService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.userInfo = this.authService.getUserInfo();
    this.isAdmin = this.isAdminUser(this.userInfo);

    if (this.isAdmin) {
      this.loadRanks();
      this.loadUsers();
    }

    this.authSubscription = this.authService.token$.subscribe(token => {
      if (!token) {
        this.users = [];
        this.isAdmin = false;
      }
    });

    this.userSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
      this.isAdmin = this.isAdminUser(userInfo);
      if (this.isAdmin) {
        if (!this.ranks.length && !this.isRanksLoading) {
          this.loadRanks();
        }
        this.loadUsers();
      } else {
        this.users = [];
      }
    });

    this.usersRefreshSubscription = this.authService.usersRefresh$.subscribe(() => {
      if (this.isAdmin) {
        this.loadUsers();
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.usersRefreshSubscription?.unsubscribe();
  }

  loadUsers(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.authService.getUsers().subscribe({
        next: (users) => {
          const normalizedUsers = users || [];
          this.users = this.sortUsers(normalizedUsers);
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 403 || error.status === 401) {
            this.errorMessage = 'אין הרשאה לצפות ברשימת המשתמשים.';
            this.users = [];
          } else if (error.status === 0) {
            this.errorMessage = 'לא ניתן להתחבר לשרת. אנא נסה שוב.';
          } else {
            this.errorMessage = 'שגיאה בטעינת המשתמשים. נסו שוב מאוחר יותר.';
          }
        }
      });
    } catch {
      this.isLoading = false;
      this.errorMessage = 'שגיאה בטעינת המשתמשים. נסו שוב מאוחר יותר.';
    }
  }

  loadRanks(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isRanksLoading = true;
    this.ranksError = '';

    this.ranksService.getRanks().subscribe({
      next: (ranks) => {
        const normalizedRanks = ranks || [];
        this.ranks = normalizedRanks;
        this.rankNameById = new Map(
          normalizedRanks
            .filter(rank => typeof rank.id === 'number')
            .map(rank => [rank.id as number, rank.name || ''])
        );
        this.isRanksLoading = false;
      },
      error: () => {
        this.isRanksLoading = false;
        this.ranksError = 'שגיאה בטעינת דרגות. נסה שוב מאוחר יותר.';
      }
    });
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  formatLastLogin(lastLoginAt?: string | null): string {
    if (!lastLoginAt) return '—';
    try {
      const date = new Date(lastLoginAt);
      if (Number.isNaN(date.getTime())) return '—';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return '—';
    }
  }

  private isAdminUser(userInfo: UserInfo | null): boolean {
    const role = (userInfo?.role || '').trim().toLowerCase();
    return role === 'admin';
  }

  private getSortableFirstName(user: User): string {
    const firstName = (user.firstName || '').trim();
    if (firstName) return firstName;
    const displayName = (user.displayName || '').trim();
    if (displayName) return displayName;
    const lastName = (user.lastName || '').trim();
    if (lastName) return lastName;
    return (user.username || user.email || '').trim();
  }

  private getSortableLastName(user: User): string {
    const lastName = (user.lastName || '').trim();
    if (lastName) return lastName;
    const firstName = (user.firstName || '').trim();
    if (firstName) return firstName;
    const displayName = (user.displayName || '').trim();
    if (displayName) return displayName;
    return (user.username || user.email || '').trim();
  }

  private getSortableRole(user: User): string {
    return (user.role || '').trim();
  }

  setSort(
    field:
      | 'firstName'
      | 'lastName'
      | 'role'
      | 'joinDate'
      | 'lastLoginAt'
      | 'currentRank'
      | 'level'
      | 'isActive'
      | 'dateOfBirth'
      | 'username'
      | 'isEmailVerified'
      | 'id'
  ): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.users = this.sortUsers(this.users);
  }

  private sortUsers(users: User[]): User[] {
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    return [...users].sort((a, b) => {
      if (this.sortField === 'joinDate') {
        const left = this.getSortableDateValue(a.joinDate);
        const right = this.getSortableDateValue(b.joinDate);
        return direction * (left - right);
      }
      if (this.sortField === 'lastLoginAt') {
        const left = this.getSortableDateValue(a.lastLoginAt);
        const right = this.getSortableDateValue(b.lastLoginAt);
        return direction * (left - right);
      }
      if (this.sortField === 'dateOfBirth') {
        const left = this.getSortableDateValue(a.dateOfBirth);
        const right = this.getSortableDateValue(b.dateOfBirth);
        return direction * (left - right);
      }
      if (this.sortField === 'id') {
        const left = typeof a.id === 'number' ? a.id : 0;
        const right = typeof b.id === 'number' ? b.id : 0;
        return direction * (left - right);
      }
      if (this.sortField === 'currentRank') {
        const left = this.getSortableRankId(a.currentRankId);
        const right = this.getSortableRankId(b.currentRankId);
        return direction * (left - right);
      }
      if (this.sortField === 'level') {
        const left = (a.level || '').trim();
        const right = (b.level || '').trim();
        return direction * this.nameCollator.compare(left, right);
      }
      if (this.sortField === 'username') {
        const left = (a.username || '').trim();
        const right = (b.username || '').trim();
        return direction * this.nameCollator.compare(left, right);
      }
      if (this.sortField === 'isActive') {
        const left = this.getSortableBooleanValue(a.isActive);
        const right = this.getSortableBooleanValue(b.isActive);
        return direction * (left - right);
      }
      if (this.sortField === 'isEmailVerified') {
        const left = this.getSortableBooleanValue(a.isEmailVerified);
        const right = this.getSortableBooleanValue(b.isEmailVerified);
        return direction * (left - right);
      }

      let left = '';
      let right = '';
      if (this.sortField === 'firstName') {
        left = this.getSortableFirstName(a);
        right = this.getSortableFirstName(b);
      } else if (this.sortField === 'lastName') {
        left = this.getSortableLastName(a);
        right = this.getSortableLastName(b);
      } else {
        left = this.getSortableRole(a);
        right = this.getSortableRole(b);
      }
      return direction * this.nameCollator.compare(left, right);
    });
  }

  private getSortableDateValue(value?: string | null): number {
    if (!value) return 0;
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  /** Numeric value for sorting by rank ID; null/undefined/invalid → -1 so they sort first when ascending. */
  private getSortableRankId(currentRankId?: number | null): number {
    if (currentRankId == null) return -1;
    const n = Number(currentRankId);
    return Number.isNaN(n) ? -1 : n;
  }

  private getSortableRankName(currentRankId?: number | null): string {
    if (!currentRankId) return '';
    return this.rankNameById.get(currentRankId) || '';
  }

  private getSortableBooleanValue(value?: boolean): number {
    if (value === true) return 1;
    if (value === false) return 0;
    return -1;
  }

  getRankName(currentRankId?: number | null): string {
    if (!currentRankId) return '—';
    const rankName = this.rankNameById.get(currentRankId);
    return rankName ? rankName : '—';
  }

  getProfileImageSrc(url?: string | null): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Prefer Google Drive thumbnail endpoint for better compatibility.
    const match = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    if (match?.[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w256`;
    }
    const idParam = trimmed.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([^&]+)/i);
    if (idParam?.[1]) {
      return `https://drive.google.com/thumbnail?id=${idParam[1]}&sz=w256`;
    }

    return trimmed;
  }

  /** Same as getProfileImageSrc but with larger size for popup (e.g. w800). */
  getProfileImageSrcLarge(url?: string | null): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;

    const match = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    if (match?.[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
    }
    const idParam = trimmed.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([^&]+)/i);
    if (idParam?.[1]) {
      return `https://drive.google.com/thumbnail?id=${idParam[1]}&sz=w800`;
    }

    return trimmed;
  }

  openImagePopup(src: string): void {
    this.popupImageSrc = src;
  }

  closeImagePopup(): void {
    this.popupImageSrc = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.popupImageSrc) {
      this.closeImagePopup();
    }
  }
}
