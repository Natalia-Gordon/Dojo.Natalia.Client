import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MarketplaceService, PurchaseItem, Order } from '../../_services/marketplace.service';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-marketplace-purchases',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './marketplace-purchases.component.html',
  styleUrl: './marketplace-purchases.component.css'
})
export class MarketplacePurchasesComponent implements OnInit {
  purchases: PurchaseItem[] = [];
  orders: Order[] = [];
  isLoading = true;
  activeTab = 'digital';
  isAuthenticated = false;
  downloadError: string | null = null;

  constructor(
    private marketplace: MarketplaceService,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isAuthenticated = this.auth.isAuthenticated();
    if (!this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/marketplace/purchases' } });
      return;
    }
    this.marketplace.getMyPurchases().subscribe((list) => {
      this.purchases = list;
      this.isLoading = false;
    });
    this.marketplace.getMyOrders().subscribe((list) => {
      this.orders = list;
    });
  }

  get digitalItems(): PurchaseItem[] {
    return this.purchases.filter((p) => p.isDigital);
  }

  get physicalItems(): PurchaseItem[] {
    return this.purchases.filter((p) => !p.isDigital);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  }

  formatDate(s: string): string {
    try {
      const d = new Date(s);
      return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return s;
    }
  }

  download(purchase: PurchaseItem): void {
    this.downloadError = null;
    this.marketplace.recordDownload(purchase.id).subscribe({
      next: (res) => {
        if (res.downloadUrl) window.open(res.downloadUrl, '_blank');
      },
      error: () => {
        this.downloadError = 'שגיאה בהורדה. נסו שוב.';
      }
    });
  }

  setTab(t: string): void {
    this.activeTab = t;
  }

  trackByPurchaseId(_i: number, p: PurchaseItem): number {
    return p.id;
  }

  trackByOrderId(_i: number, o: Order): number {
    return o.id;
  }
}
