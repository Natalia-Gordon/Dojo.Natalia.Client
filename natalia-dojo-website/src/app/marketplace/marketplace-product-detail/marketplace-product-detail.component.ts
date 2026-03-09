import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MarketplaceService, Product } from '../../_services/marketplace.service';
import { AuthService } from '../../_services/auth.service';

@Component({
  selector: 'app-marketplace-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './marketplace-product-detail.component.html',
  styleUrl: './marketplace-product-detail.component.css'
})
export class MarketplaceProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  errorMessage = '';
  isAuthenticated = false;
  addSuccess = '';
  /** Whether the current user already owns this product (prevents repurchasing). */
  isProductOwned = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketplace: MarketplaceService,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isAuthenticated = this.auth.isAuthenticated();
    const id = this.route.snapshot.paramMap.get('id');
    const numId = id ? parseInt(id, 10) : NaN;
    if (Number.isNaN(numId)) {
      this.router.navigate(['/marketplace']);
      return;
    }
    if (this.isAuthenticated) {
      this.marketplace.getMyPurchases().subscribe((list) => {
        this.isProductOwned = list.some((p) => p.productId === numId);
      });
    }
    this.marketplace.getProductById(numId).subscribe({
      next: (p) => {
        this.product = p;
        this.isLoading = false;
        if (!p) this.router.navigate(['/marketplace']);
      },
      error: () => {
        this.errorMessage = 'שגיאה בטעינת המוצר.';
        this.isLoading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  }

  addToCart(): void {
    if (!this.product || !this.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (!this.product.inStock || this.isProductOwned) return;
    this.marketplace.addToCart(this.product.id, 1).subscribe({
      next: () => {
        this.addSuccess = 'המוצר נוסף לסל';
        setTimeout(() => (this.addSuccess = ''), 3000);
      },
      error: () => {
        this.errorMessage = 'לא ניתן להוסיף לסל. נסו שוב או התחברו.';
      }
    });
  }

  goToCart(): void {
    this.router.navigate(['/marketplace/cart']);
  }
}
