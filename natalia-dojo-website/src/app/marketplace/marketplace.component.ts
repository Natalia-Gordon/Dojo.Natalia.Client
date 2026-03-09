import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketplaceService, Product, ProductCategory } from '../_services/marketplace.service';
import { AuthService } from '../_services/auth.service';
import { MarketplaceHeroComponent } from './marketplace-hero/marketplace-hero.component';

type CategoryTab = { id: string; label: string; type?: string; categoryId?: number };

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MarketplaceHeroComponent],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent implements OnInit {
  categories: ProductCategory[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  activeTab = 'all';
  /** Product IDs the current user has purchased (owned) – prevents repurchasing. */
  ownedProductIds = new Set<number>();
  isAuthenticated = false;

  tabs: CategoryTab[] = [
    { id: 'all', label: 'הכל' },
    { id: 'painting', label: 'אמנות דיגיטלית', type: 'painting' },
    { id: 'weapon', label: 'נשקים', type: 'weapon' },
    { id: 'tool', label: 'כלי אימון', type: 'tool' },
    { id: 'equipment', label: 'ציוד', type: 'equipment' },
    { id: 'book', label: 'ספרים', type: 'book' }
  ];

  constructor(
    private marketplace: MarketplaceService,
    private auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isAuthenticated = this.auth.isAuthenticated();
    this.loadCategories();
    this.loadProducts();
    if (this.isAuthenticated) this.loadOwnedProductIds();
  }

  /** Load purchased product IDs for "Owned" badges and to prevent repurchasing. */
  loadOwnedProductIds(): void {
    this.marketplace.getMyPurchases().subscribe((list) => {
      this.ownedProductIds = new Set(list.map((p) => p.productId));
    });
  }

  isOwned(productId: number): boolean {
    return this.ownedProductIds.has(productId);
  }

  loadCategories(): void {
    this.marketplace.getCategories().subscribe((list) => {
      this.categories = list;
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.marketplace.getProducts({ inStockOnly: false }).subscribe({
      next: (list) => {
        this.products = list;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'שגיאה בטעינת המוצרים. נסו שוב מאוחר יותר.';
        this.isLoading = false;
      }
    });
  }

  setTab(tabId: string): void {
    this.activeTab = tabId;
    this.applyFilters();
  }

  applyFilters(): void {
    let list = this.products;
    const tab = this.tabs.find((t) => t.id === this.activeTab);
    if (tab?.type) {
      if (tab.type === 'tool') {
        list = list.filter((p) => p.type === 'tool' || p.type === 'equipment');
      } else {
        list = list.filter((p) => p.type === tab.type);
      }
    }
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.teacherName && p.teacherName.toLowerCase().includes(q))
      );
    }
    this.filteredProducts = list;
  }

  getProductTypeLabel(type: string | null | undefined): string {
    if (!type) return '—';
    const map: Record<string, string> = {
      painting: 'אמנות דיגיטלית',
      weapon: 'נשק',
      tool: 'כלי אימון',
      equipment: 'ציוד',
      book: 'ספר'
    };
    return map[type.toLowerCase()] ?? type;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  }

  trackByProductId(_index: number, p: Product): number {
    return p.id;
  }
}
