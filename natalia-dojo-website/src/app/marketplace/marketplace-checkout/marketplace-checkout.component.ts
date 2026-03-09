import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketplaceService, Cart, CreateOrderRequest } from '../../_services/marketplace.service';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-marketplace-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './marketplace-checkout.component.html',
  styleUrl: './marketplace-checkout.component.css'
})
export class MarketplaceCheckoutComponent implements OnInit {
  cart: Cart = { items: [] };
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';
  orderSuccess = false;
  orderId: number | null = null;

  form: CreateOrderRequest = {
    billingName: '',
    billingEmail: '',
    billingAddress: '',
    billingCity: '',
    billingZipCode: '',
    billingCountry: 'ישראל',
    shippingName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingZipCode: '',
    shippingCountry: 'ישראל'
  };

  constructor(
    private marketplace: MarketplaceService,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/marketplace/checkout' } });
      return;
    }
    this.loadCart();
    const user = this.auth.getUserInfo();
    if (user) {
      this.form.billingName = user.displayName || user.username || '';
      this.form.billingEmail = user.email || '';
    }
  }

  loadCart(): void {
    this.isLoading = true;
    this.marketplace.getCart().subscribe({
      next: (c) => {
        this.cart = c;
        this.isLoading = false;
        if (c.items.length === 0) this.router.navigate(['/marketplace/cart']);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get cartTotal(): number {
    return this.cart.items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  }

  submitOrder(): void {
    this.errorMessage = '';
    this.isSubmitting = true;
    this.marketplace.createOrder(this.form).subscribe({
      next: (order) => {
        this.orderId = order.id;
        this.orderSuccess = true;
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'שגיאה ביצירת ההזמנה. נסו שוב.';
        this.isSubmitting = false;
      }
    });
  }

  goToPurchases(): void {
    this.router.navigate(['/marketplace/purchases']);
  }

  goToMarketplace(): void {
    this.router.navigate(['/marketplace']);
  }

  trackByItemId(_index: number, item: { id: number }): number {
    return item.id;
  }
}
