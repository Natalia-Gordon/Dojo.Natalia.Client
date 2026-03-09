import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MarketplaceService, Cart, CartItem } from '../../_services/marketplace.service';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-marketplace-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './marketplace-cart.component.html',
  styleUrl: './marketplace-cart.component.css'
})
export class MarketplaceCartComponent implements OnInit {
  cart: Cart = { items: [] };
  isLoading = true;
  isAuthenticated = false;

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
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/marketplace/cart' } });
      return;
    }
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.marketplace.getCart().subscribe({
      next: (c) => {
        this.cart = c;
        this.isLoading = false;
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

  updateQty(item: CartItem, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    this.marketplace.updateCartItem(item.id, newQty).subscribe({
      next: (c) => {
        this.cart = c;
      }
    });
  }

  removeItem(item: CartItem): void {
    this.marketplace.removeCartItem(item.id).subscribe({
      next: (c) => {
        this.cart = c;
      }
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/marketplace/checkout']);
  }

  trackByItemId(_index: number, item: CartItem): number {
    return item.id;
  }
}
