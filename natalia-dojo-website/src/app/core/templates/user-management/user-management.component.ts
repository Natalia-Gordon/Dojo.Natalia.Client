import { Component, OnDestroy, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService, User, UserInfo } from '../../../_services/auth.service';
import { LoginModalService } from '../../../_services/login-modal.service';
import { Rank, RanksService } from '../../../_services/ranks.service';
import { InstructorsService, Instructor, InstructorPaymentMethodDto } from '../../../_services/instructors.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [FormsModule],
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

  /** Selected user row (by id), null when none selected */
  selectedUserId: number | null = null;

  /** Username search filter (client-side) */
  usernameSearchQuery = '';

  /** True when 401/403 - show re-login option */
  isUnauthorized = false;

  /** User pending delete confirmation, null when dialog closed */
  deleteConfirmUser: User | null = null;

  /** User for bank details form; null when dialog closed */
  bankDetailsUser: User | null = null;
  /** Instructor ID for selected user's bank details (when available) */
  bankDetailsInstructorId: number | null = null;
  bankForm: {
    accountHolderName: string;
    bankName: string;
    bankNumber: string;
    branchName: string;
    branchNumber: string;
    accountNumber: string;
    bankAddress: string;
  } = {
    accountHolderName: '',
    bankName: '',
    bankNumber: '',
    branchName: '',
    branchNumber: '',
    accountNumber: '',
    bankAddress: ''
  };
  isBankFormLoading = false;
  bankFormError = '';

  /** Per-user avatar URL overrides when primary Google Drive format fails (fallback attempts) */
  avatarSrcOverride: Record<number, string> = {};
  /** Per-user attempt index: 0=thumbnail, 1=uc view, 2=uc download */
  avatarAttemptByUserId: Record<number, number> = {};
  /** User IDs for which all avatar load attempts failed */
  avatarFailedIds = new Set<number>();

  private authSubscription?: Subscription;
  private userSubscription?: Subscription;
  private usersRefreshSubscription?: Subscription;
  private reconnectSubscription?: Subscription;
  private readonly nameCollator = new Intl.Collator(['he', 'en'], {
    sensitivity: 'base',
    numeric: true
  });
  private rankNameById = new Map<number, string>();

  constructor(
    private authService: AuthService,
    private loginModalService: LoginModalService,
    private ranksService: RanksService,
    private instructorsService: InstructorsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.userInfo = this.authService.getUserInfo();
    this.isAdmin = this.isAdminUser(this.userInfo);

    if (this.isAdmin) {
      if (this.authService.isTokenExpired()) {
        this.isUnauthorized = true;
        this.errorMessage = 'שגיאה: הגישה נדחתה. יש להתחבר מחדש';
      } else {
        this.loadRanks();
        this.loadUsers();
      }
    }

    this.authSubscription = this.authService.token$.subscribe(token => {
      if (!token) {
        this.users = [];
        if (this.isAdmin) {
          this.isUnauthorized = true;
          this.errorMessage = 'שגיאה: הגישה נדחתה. יש להתחבר מחדש';
        }
        this.isAdmin = false;
        this.isLoading = false;
      }
    });

    this.userSubscription = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
      this.isAdmin = this.isAdminUser(userInfo);
      if (this.isAdmin && !this.authService.isTokenExpired() && !this.isUnauthorized) {
        if (!this.ranks.length && !this.isRanksLoading) {
          this.loadRanks();
        }
        this.loadUsers();
      } else if (!this.isAdmin) {
        this.users = [];
      }
    });

    this.usersRefreshSubscription = this.authService.usersRefresh$.subscribe(() => {
      if (this.isAdmin && !this.authService.isTokenExpired() && !this.isUnauthorized) {
        this.loadUsers();
      }
    });

    this.reconnectSubscription = this.loginModalService.reconnectSuccess$.subscribe(() => {
      const info = this.authService.getUserInfo();
      if (info && this.isAdminUser(info)) {
        this.isAdmin = true;
        this.isUnauthorized = false;
        this.errorMessage = '';
        this.loadRanks();
        this.loadUsers();
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.usersRefreshSubscription?.unsubscribe();
    this.reconnectSubscription?.unsubscribe();
  }

  loadUsers(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.authService.isTokenExpired()) {
      this.isUnauthorized = true;
      this.errorMessage = 'שגיאה: הגישה נדחתה. יש להתחבר מחדש';
      this.users = [];
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.authService.getUsers().subscribe({
        next: (users) => {
          const normalizedUsers = users || [];
          this.users = this.sortUsers(normalizedUsers);
          this.avatarSrcOverride = {};
          this.avatarAttemptByUserId = {};
          this.avatarFailedIds = new Set();
          this.isLoading = false;
          this.isUnauthorized = false;
          this.errorMessage = '';
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 403 || error.status === 401) {
            this.isUnauthorized = true;
            this.errorMessage = 'שגיאה: הגישה נדחתה. יש להתחבר מחדש';
            this.users = [];
          } else if (error.status === 0) {
            this.isUnauthorized = false;
            this.errorMessage = 'לא ניתן להתחבר לשרת. אנא נסה שוב.';
          } else {
            this.isUnauthorized = false;
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
    if (!isPlatformBrowser(this.platformId) || this.authService.isTokenExpired()) {
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

  onUsernameSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.usernameSearchQuery = input?.value ?? '';
  }

  /** Users filtered by username search query; returns full list when query is empty */
  get filteredUsers(): User[] {
    const query = (this.usernameSearchQuery || '').trim().toLowerCase();
    if (!query) return this.users;
    return this.users.filter(user => {
      const username = (user.username || '').toLowerCase();
      return username.includes(query);
    });
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

  /** Extract Google Drive file ID from various URL formats. */
  private getDriveFileId(url?: string | null): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    if (match?.[1]) return match[1];
    const idParam = trimmed.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([^&]+)/i);
    if (idParam?.[1]) return idParam[1];
    const idInUrl = trimmed.match(/[?&]id=([^&]+)/i);
    if (idInUrl?.[1]) return idInUrl[1];
    return null;
  }

  /**
   * Get Google Drive image URL for a given attempt.
   * Attempt 0: thumbnail API; 1: uc export=view; 2: uc export=download.
   */
  private getProfileImageUrlForAttempt(
    url: string | null | undefined,
    attempt: number,
    size: 'w256' | 'w800' = 'w256'
  ): string | null {
    const fileId = this.getDriveFileId(url);
    if (!fileId) return url?.trim() || null;
    if (attempt === 0) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
    }
    if (attempt === 1) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    if (attempt === 2) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
    return null;
  }

  /** Display URL for avatar in table. Uses override if retrying after error. */
  getDisplayAvatarSrc(user: User): string | null {
    if (this.avatarFailedIds.has(user.id)) return null;
    const override = this.avatarSrcOverride[user.id];
    if (override) return override;
    return this.getProfileImageUrlForAttempt(user.profileImageUrl, 0, 'w256');
  }

  /** Large URL for popup. Matches the format used for display when possible. */
  getDisplayAvatarSrcLarge(user: User): string | null {
    if (this.avatarFailedIds.has(user.id)) return null;
    const override = this.avatarSrcOverride[user.id];
    if (override) return override;
    return this.getProfileImageUrlForAttempt(user.profileImageUrl, 0, 'w800');
  }

  /** Whether the user has a displayable avatar (has URL and hasn't failed). */
  hasDisplayableAvatar(user: User): boolean {
    return !!this.getDisplayAvatarSrc(user);
  }

  /** Handle avatar load error: try alternative Google Drive URL formats. */
  onAvatarError(user: User, event: Event): void {
    const imgElement = (event.target as HTMLImageElement) ?? (event as unknown as { target?: HTMLImageElement })?.target;
    if (!imgElement?.src) return;

    const fileId = this.getDriveFileId(user.profileImageUrl);
    if (!fileId) {
      this.avatarFailedIds.add(user.id);
      this.avatarFailedIds = new Set(this.avatarFailedIds);
      return;
    }

    const currentAttempt = this.avatarAttemptByUserId[user.id] ?? 0;
    const nextAttempt = currentAttempt + 1;
    const nextUrl = this.getProfileImageUrlForAttempt(user.profileImageUrl, nextAttempt, 'w256');

    if (!nextUrl) {
      this.avatarFailedIds.add(user.id);
      this.avatarFailedIds = new Set(this.avatarFailedIds);
      delete this.avatarSrcOverride[user.id];
      delete this.avatarAttemptByUserId[user.id];
      this.avatarSrcOverride = { ...this.avatarSrcOverride };
      return;
    }

    this.avatarAttemptByUserId[user.id] = nextAttempt;
    this.avatarSrcOverride = { ...this.avatarSrcOverride, [user.id]: nextUrl };
    imgElement.src = nextUrl;
  }

  /** Legacy: return first-format URL (thumbnail). Used for compatibility. */
  getProfileImageSrc(url?: string | null): string | null {
    return this.getProfileImageUrlForAttempt(url, 0, 'w256');
  }

  /** Same as getProfileImageSrc but with larger size for popup (e.g. w800). */
  getProfileImageSrcLarge(url?: string | null): string | null {
    return this.getProfileImageUrlForAttempt(url, 0, 'w800');
  }

  selectUser(user: User): void {
    this.selectedUserId = this.selectedUserId === user.id ? null : user.id;
  }

  isUserSelected(user: User): boolean {
    return this.selectedUserId === user.id;
  }

  /** Whether the selected user has instructor (or teacher) role */
  get isSelectedUserInstructor(): boolean {
    const user = this.getSelectedUser();
    if (!user) return false;
    const role = (user.role || '').trim().toLowerCase();
    return role === 'instructor' || role === 'teacher';
  }

  openBankDetailsForm(): void {
    const user = this.getSelectedUser();
    if (!user || !isPlatformBrowser(this.platformId)) return;
    this.bankDetailsUser = user;
    this.bankDetailsInstructorId = null;
    this.bankFormError = '';

    const resetForm = () => {
      this.bankForm = {
        accountHolderName: '',
        bankName: '',
        bankNumber: '',
        branchName: '',
        branchNumber: '',
        accountNumber: '',
        bankAddress: ''
      };
    };

    // Load selected user's instructor record (including payment methods) to prefill form
    this.instructorsService.getInstructors(true).subscribe({
      next: (instructors) => {
        const inst = (instructors || []).find(i => i.userId === user.id);
        if (!inst) {
          resetForm();
          return;
        }

        this.bankDetailsInstructorId = inst.instructorId ?? null;

        const paymentMethods = inst.paymentMethods || [];
        const bankMethod: InstructorPaymentMethodDto | undefined =
          paymentMethods.find(m => m.paymentType === 'bank_transfer' && m.isDefault) ||
          paymentMethods.find(m => m.paymentType === 'bank_transfer');

        if (bankMethod) {
          this.bankForm = {
            accountHolderName: bankMethod.accountHolderName || '',
            bankName: bankMethod.bankName || '',
            bankNumber: bankMethod.bankNumber || '',
            branchName: bankMethod.branchName || '',
            branchNumber: bankMethod.branchNumber || '',
            accountNumber: bankMethod.accountNumber || '',
            bankAddress: bankMethod.bankAddress || ''
          };
        } else {
          this.bankForm = {
            accountHolderName: inst.accountHolderName || '',
            bankName: inst.bankName || '',
            bankNumber: inst.bankNumber || '',
            branchName: inst.branchName || '',
            branchNumber: inst.branchNumber || '',
            accountNumber: inst.accountNumber || '',
            bankAddress: inst.bankAddress || ''
          };
        }
      },
      error: () => resetForm()
    });
  }

  closeBankDetailsForm(): void {
    this.bankDetailsUser = null;
    this.bankDetailsInstructorId = null;
    this.bankFormError = '';
  }

  saveBankDetails(): void {
    const user = this.bankDetailsUser;
    const instructorId = this.bankDetailsInstructorId;
    if (!user || instructorId == null) {
      this.bankFormError = 'לא ניתן לשמור פרטי בנק עבור משתמש זה.';
      return;
    }
    this.isBankFormLoading = true;
    this.bankFormError = '';

    const trim = (val: string) => (val || '').trim();

    const payload = {
      bankName: trim(this.bankForm.bankName) || null,
      accountHolderName: trim(this.bankForm.accountHolderName) || null,
      accountNumber: trim(this.bankForm.accountNumber) || null,
      bankAddress: trim(this.bankForm.bankAddress) || null,
      bankNumber: trim(this.bankForm.bankNumber) || null,
      branchName: trim(this.bankForm.branchName) || null,
      branchNumber: trim(this.bankForm.branchNumber) || null
    };

    const hasBank =
      !!(payload.bankName ||
        payload.accountHolderName ||
        payload.accountNumber ||
        payload.bankNumber ||
        payload.branchName ||
        payload.branchNumber);

    if (!hasBank) {
      this.isBankFormLoading = false;
      this.bankFormError = 'יש למלא לפחות שדה אחד של פרטי בנק.';
      return;
    }

    this.instructorsService.updateInstructorBankDetails(instructorId, payload).subscribe({
      next: () => {
        this.isBankFormLoading = false;
        this.closeBankDetailsForm();
      },
      error: (err) => {
        this.isBankFormLoading = false;
        this.bankFormError = err?.error?.message ?? 'שגיאה בשמירת פרטי הבנק. נסה שוב.';
      }
    });
  }

  openImagePopup(src: string): void {
    this.popupImageSrc = src;
  }

  closeImagePopup(): void {
    this.popupImageSrc = null;
  }

  openRegisterForm(): void {
    this.loginModalService.open('register');
  }

  /** Open login modal for re-authentication (401/403 recovery) */
  openLoginModal(): void {
    this.loginModalService.openForReconnect(this.authService.getUserInfo()?.username ?? null);
  }

  getSelectedUser(): User | null {
    if (!this.selectedUserId) return null;
    return this.users.find(u => u.id === this.selectedUserId) ?? null;
  }

  deleteSelectedUser(): void {
    const user = this.getSelectedUser();
    if (!user || !isPlatformBrowser(this.platformId)) return;
    this.deleteConfirmUser = user;
  }

  cancelDeleteUser(): void {
    this.deleteConfirmUser = null;
  }

  confirmDeleteUser(): void {
    const user = this.deleteConfirmUser;
    if (!user) return;
    this.deleteConfirmUser = null;
    this.authService.deleteUser(user.id).subscribe({
      next: () => {
        this.selectedUserId = null;
        this.loadUsers();
      },
      error: err => {
        this.errorMessage = err.error?.message ?? 'שגיאה במחיקת המשתמש. נסה שוב.';
      }
    });
  }

  getDeleteConfirmUserName(): string {
    const u = this.deleteConfirmUser;
    if (!u) return '';
    return (u.displayName || u.username || u.email || `משתמש ${u.id}`).trim();
  }

  openUpdateUserForm(): void {
    const user = this.getSelectedUser();
    if (!user) return;
    this.loginModalService.openRegisterForEditUser({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      phone: user.phone ?? user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      currentRankId: user.currentRankId,
      profileImageUrl: user.profileImageUrl,
      bio: user.bio,
      isActive: user.isActive
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.deleteConfirmUser) {
      this.cancelDeleteUser();
    } else if (this.bankDetailsUser) {
      this.closeBankDetailsForm();
    } else if (this.popupImageSrc) {
      this.closeImagePopup();
    }
  }
}
