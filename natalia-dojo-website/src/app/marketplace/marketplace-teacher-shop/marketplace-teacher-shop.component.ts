import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketplaceService, Product, TeacherStats, Order, CreateProductRequest } from '../../_services/marketplace.service';

@Component({
  selector: 'app-marketplace-teacher-shop',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './marketplace-teacher-shop.component.html',
  styleUrl: './marketplace-teacher-shop.component.css'
})
export class MarketplaceTeacherShopComponent implements OnInit {
  products: Product[] = [];
  stats: TeacherStats = { totalProducts: 0, totalSold: 0, totalRevenue: 0 };
  orders: Order[] = [];
  isLoading = true;
  activeTab = 'products';
  showForm = false;
  editingProduct: Product | null = null;
  form: CreateProductRequest = {
    name: '',
    description: '',
    price: 0,
    type: 'tool',
    imageUrl: '',
    isDigital: false,
    inStock: true,
    stockQuantity: null
  };
  errorMessage = '';
  successMessage = '';

  constructor(
    private marketplace: MarketplaceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadProducts();
    this.loadStats();
    this.loadOrders();
  }

  loadProducts(): void {
    this.marketplace.getTeacherProducts().subscribe((list) => {
      this.products = list;
      this.isLoading = false;
    });
  }

  loadStats(): void {
    this.marketplace.getTeacherStats().subscribe((s) => {
      this.stats = s;
    });
  }

  loadOrders(): void {
    this.marketplace.getTeacherOrders().subscribe((list) => {
      this.orders = list;
    });
  }

  setTab(t: string): void {
    this.activeTab = t;
  }

  openAdd(): void {
    this.editingProduct = null;
    this.form = {
      name: '',
      description: '',
      price: 0,
      type: 'tool',
      imageUrl: '',
      isDigital: false,
      inStock: true,
      stockQuantity: null
    };
    this.showForm = true;
    this.errorMessage = '';
  }

  openEdit(p: Product): void {
    this.editingProduct = p;
    this.form = {
      name: p.name,
      description: p.description || '',
      price: p.price,
      type: p.type,
      imageUrl: p.imageUrl || '',
      isDigital: p.isDigital,
      inStock: p.inStock,
      stockQuantity: p.stockQuantity ?? null
    };
    this.showForm = true;
    this.errorMessage = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.editingProduct = null;
  }

  submitForm(): void {
    this.errorMessage = '';
    const body = { ...this.form };
    if (this.editingProduct) {
      this.marketplace.updateProduct(this.editingProduct.id, body).subscribe({
        next: () => {
          this.successMessage = 'המוצר עודכן.';
          this.closeForm();
          this.loadProducts();
          this.loadStats();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'שגיאה בעדכון.';
        }
      });
    } else {
      this.marketplace.createProduct(body).subscribe({
        next: () => {
          this.successMessage = 'המוצר נוצר.';
          this.closeForm();
          this.loadProducts();
          this.loadStats();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'שגיאה ביצירה.';
        }
      });
    }
  }

  deleteProduct(p: Product): void {
    if (!confirm('למחוק את המוצר "' + p.name + '"?')) return;
    this.marketplace.deleteProduct(p.id).subscribe({
      next: () => {
        this.loadProducts();
        this.loadStats();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'שגיאה במחיקה.';
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  }

  formatDate(s: string): string {
    try {
      return new Date(s).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return s;
    }
  }

  getProductTypeLabel(type: string): string {
    const map: Record<string, string> = {
      painting: 'אמנות דיגיטלית',
      weapon: 'נשק',
      tool: 'כלי אימון',
      equipment: 'ציוד',
      book: 'ספר'
    };
    return map[type] ?? type;
  }

  trackByProductId(_i: number, p: Product): number {
    return p.id;
  }

  trackByOrderId(_i: number, o: Order): number {
    return o.id;
  }
}
