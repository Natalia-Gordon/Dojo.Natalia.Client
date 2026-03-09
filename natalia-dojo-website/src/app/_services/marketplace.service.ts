import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

const MARKETPLACE_URL = `${environment.apiUrl}/marketplace`;

export type ProductType = 'painting' | 'weapon' | 'tool' | 'equipment' | 'book';

export interface ProductCategory {
  id: number;
  name: string;
  slug?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  type: ProductType | string;
  teacherId: number | null;
  teacherName: string | null;
  categoryId: number | null;
  categoryName?: string | null;
  imageUrl: string | null;
  inStock: boolean;
  stockQuantity: number | null;
  isDigital: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: number;
  productId: number;
  product?: Product;
  quantity: number;
  price?: number;
  productName?: string;
  productImageUrl?: string | null;
  teacherName?: string | null;
}

export interface Cart {
  id?: number;
  userId?: number;
  items: CartItem[];
  total?: number;
}

export interface CreateOrderRequest {
  billingName: string;
  billingEmail: string;
  billingAddress?: string | null;
  billingCity?: string | null;
  billingZipCode?: string | null;
  billingCountry?: string | null;
  shippingName?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingZipCode?: string | null;
  shippingCountry?: string | null;
}

export interface OrderItemDto {
  productId: number;
  productName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  total: number;
  billingName?: string | null;
  billingEmail?: string | null;
  billingAddress?: string | null;
  billingCity?: string | null;
  billingZipCode?: string | null;
  billingCountry?: string | null;
  shippingName?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingZipCode?: string | null;
  shippingCountry?: string | null;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  id: number;
  productId: number;
  product?: Product;
  orderId?: number;
  productName?: string | null;
  productImageUrl?: string | null;
  isDigital: boolean;
  downloadUrl?: string | null;
  purchasedAt: string;
}

export interface TeacherStats {
  totalProducts: number;
  totalSold: number;
  totalRevenue: number;
  ordersCount?: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string | null;
  price: number;
  type: ProductType | string;
  categoryId?: number | null;
  imageUrl?: string | null;
  isDigital: boolean;
  inStock: boolean;
  stockQuantity?: number | null;
  teacherId?: number | null;
}

export interface UpdateProductRequest extends CreateProductRequest {}

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private get authHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getCategories(): Observable<ProductCategory[]> {
    return this.http.get<ProductCategory[]>(`${MARKETPLACE_URL}/categories`).pipe(
      catchError((err) => {
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getCategories error:', err);
        return of([]);
      }),
      map((raw: any) => Array.isArray(raw) ? raw : [])
    );
  }

  getProducts(params?: {
    categoryId?: number;
    type?: string;
    teacherId?: number;
    search?: string;
    inStockOnly?: boolean;
  }): Observable<Product[]> {
    let httpParams = new HttpParams();
    if (params?.categoryId != null) httpParams = httpParams.set('categoryId', params.categoryId.toString());
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.teacherId != null) httpParams = httpParams.set('teacherId', params.teacherId.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.inStockOnly === true) httpParams = httpParams.set('inStockOnly', 'true');

    return this.http.get<Product[]>(`${MARKETPLACE_URL}/products`, { params: httpParams }).pipe(
      catchError((err) => {
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getProducts error:', err);
        return of([]);
      }),
      map((raw: any) => (Array.isArray(raw) ? raw : []).map((p: any) => this.normalizeProduct(p)))
    );
  }

  getProductById(id: number): Observable<Product | null> {
    return this.http.get<Product>(`${MARKETPLACE_URL}/products/${id}`).pipe(
      map((p: any) => this.normalizeProduct(p)),
      catchError((err) => {
        if (err.status === 404) return of(null);
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getProductById error:', err);
        return of(null);
      })
    );
  }

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${MARKETPLACE_URL}/cart`, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        if (err.status === 401) return of({ items: [] });
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getCart error:', err);
        return of({ items: [] });
      }),
      map((raw: any) => this.normalizeCart(raw))
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<Cart> {
    return this.http.post<Cart>(`${MARKETPLACE_URL}/cart/items`, { productId, quantity }, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        console.error('Marketplace addToCart error:', err);
        return throwError(() => err);
      }),
      map((raw: any) => this.normalizeCart(raw))
    );
  }

  updateCartItem(itemId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${MARKETPLACE_URL}/cart/items/${itemId}`, { quantity }, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        console.error('Marketplace updateCartItem error:', err);
        return throwError(() => err);
      }),
      map((raw: any) => this.normalizeCart(raw))
    );
  }

  removeCartItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${MARKETPLACE_URL}/cart/items/${itemId}`, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        console.error('Marketplace removeCartItem error:', err);
        return throwError(() => err);
      }),
      map((raw: any) => this.normalizeCart(raw))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${MARKETPLACE_URL}/cart`, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        console.error('Marketplace clearCart error:', err);
        return throwError(() => err);
      })
    );
  }

  createOrder(body: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${MARKETPLACE_URL}/orders`, body, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        console.error('Marketplace createOrder error:', err);
        return throwError(() => err);
      }),
      map((raw: any) => this.normalizeOrder(raw))
    );
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${MARKETPLACE_URL}/orders`, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        if (err.status === 401) return of([]);
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getMyOrders error:', err);
        return of([]);
      }),
      map((raw: any) => (Array.isArray(raw) ? raw : []).map((o: any) => this.normalizeOrder(o)))
    );
  }

  getOrderById(id: number): Observable<Order | null> {
    return this.http.get<Order>(`${MARKETPLACE_URL}/orders/${id}`, { headers: this.authHeaders }).pipe(
      map((o: any) => this.normalizeOrder(o)),
      catchError((err) => {
        if (err.status === 404) return of(null);
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getOrderById error:', err);
        return of(null);
      })
    );
  }

  getMyPurchases(digitalOnly?: boolean): Observable<PurchaseItem[]> {
    let params = new HttpParams();
    if (digitalOnly === true) params = params.set('digitalOnly', 'true');
    return this.http.get<PurchaseItem[]>(`${MARKETPLACE_URL}/purchases`, { headers: this.authHeaders, params }).pipe(
      catchError((err) => {
        if (err.status === 401) return of([]);
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getMyPurchases error:', err);
        return of([]);
      }),
      map((raw: any) => Array.isArray(raw) ? raw : [])
    );
  }

  recordDownload(purchaseId: number): Observable<{ downloadUrl: string }> {
    return this.http.post<{ downloadUrl: string }>(`${MARKETPLACE_URL}/purchases/${purchaseId}/download`, {}, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        console.error('Marketplace recordDownload error:', err);
        return throwError(() => err);
      })
    );
  }

  getTeacherProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${MARKETPLACE_URL}/teacher/products`, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getTeacherProducts error:', err);
        return of([]);
      }),
      map((raw: any) => (Array.isArray(raw) ? raw : []).map((p: any) => this.normalizeProduct(p)))
    );
  }

  createProduct(body: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${MARKETPLACE_URL}/teacher/products`, body, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        console.error('Marketplace createProduct error:', err);
        return throwError(() => err);
      }),
      map((p: any) => this.normalizeProduct(p))
    );
  }

  updateProduct(id: number, body: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${MARKETPLACE_URL}/teacher/products/${id}`, body, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        console.error('Marketplace updateProduct error:', err);
        return throwError(() => err);
      }),
      map((p: any) => this.normalizeProduct(p))
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${MARKETPLACE_URL}/teacher/products/${id}`, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        console.error('Marketplace deleteProduct error:', err);
        return throwError(() => err);
      })
    );
  }

  getTeacherStats(): Observable<TeacherStats> {
    return this.http.get<TeacherStats>(`${MARKETPLACE_URL}/teacher/stats`, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getTeacherStats error:', err);
        return of({ totalProducts: 0, totalSold: 0, totalRevenue: 0 });
      }),
      map((raw: any) => ({
        totalProducts: raw?.totalProducts ?? 0,
        totalSold: raw?.totalSold ?? 0,
        totalRevenue: raw?.totalRevenue ?? 0,
        ordersCount: raw?.ordersCount
      }))
    );
  }

  getTeacherOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${MARKETPLACE_URL}/teacher/orders`, { headers: this.authHeaders }).pipe(
      catchError((err) => {
        if (err.status !== 0 && err.status !== 503) console.error('Marketplace getTeacherOrders error:', err);
        return of([]);
      }),
      map((raw: any) => (Array.isArray(raw) ? raw : []).map((o: any) => this.normalizeOrder(o)))
    );
  }

  private normalizeProduct(p: any): Product {
    return {
      id: p.id ?? p.Id,
      name: p.name ?? p.Name ?? '',
      description: p.description ?? p.Description ?? null,
      price: typeof (p.price ?? p.Price) === 'number' ? (p.price ?? p.Price) : 0,
      type: p.type ?? p.Type ?? 'tool',
      teacherId: p.teacherId ?? p.TeacherId ?? null,
      teacherName: p.teacherName ?? p.TeacherName ?? null,
      categoryId: p.categoryId ?? p.CategoryId ?? null,
      categoryName: p.categoryName ?? p.CategoryName ?? null,
      imageUrl: p.imageUrl ?? p.image_url ?? p.ImageUrl ?? null,
      inStock: !!(p.inStock ?? p.InStock ?? true),
      stockQuantity: p.stockQuantity ?? p.stock_quantity ?? p.StockQuantity ?? null,
      isDigital: !!(p.isDigital ?? p.is_digital ?? p.IsDigital ?? false),
      createdAt: p.createdAt ?? p.CreatedAt,
      updatedAt: p.updatedAt ?? p.UpdatedAt
    };
  }

  private normalizeCart(c: any): Cart {
    const items: CartItem[] = Array.isArray(c?.items) ? c.items.map((i: any) => ({
      id: i.id ?? i.Id,
      productId: i.productId ?? i.ProductId ?? i.productId,
      quantity: i.quantity ?? i.Quantity ?? 1,
      price: i.price ?? i.Price ?? i.unitPrice,
      productName: i.productName ?? i.ProductName,
      productImageUrl: i.productImageUrl ?? i.product_image_url ?? i.imageUrl,
      product: i.product ? this.normalizeProduct(i.product) : undefined,
      teacherName: i.teacherName ?? i.TeacherName
    })) : [];
    return {
      id: c?.id ?? c?.Id,
      userId: c?.userId ?? c?.UserId,
      items,
      total: c?.total ?? c?.Total ?? items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)
    };
  }

  private normalizeOrder(o: any): Order {
    const items: OrderItemDto[] = Array.isArray(o?.items) ? o.items.map((i: any) => ({
      productId: i.productId ?? i.ProductId,
      productName: i.productName ?? i.ProductName,
      quantity: i.quantity ?? i.Quantity ?? 1,
      unitPrice: i.unitPrice ?? i.UnitPrice ?? i.price ?? 0,
      totalPrice: i.totalPrice ?? i.TotalPrice
    })) : [];
    return {
      id: o.id ?? o.Id,
      userId: o.userId ?? o.UserId,
      status: o.status ?? o.Status ?? 'pending',
      total: o.total ?? o.Total ?? 0,
      billingName: o.billingName ?? o.BillingName,
      billingEmail: o.billingEmail ?? o.BillingEmail,
      billingAddress: o.billingAddress ?? o.BillingAddress,
      billingCity: o.billingCity ?? o.BillingCity,
      billingZipCode: o.billingZipCode ?? o.BillingZipCode,
      billingCountry: o.billingCountry ?? o.BillingCountry,
      shippingName: o.shippingName ?? o.ShippingName,
      shippingAddress: o.shippingAddress ?? o.ShippingAddress,
      shippingCity: o.shippingCity ?? o.ShippingCity,
      shippingZipCode: o.shippingZipCode ?? o.ShippingZipCode,
      shippingCountry: o.shippingCountry ?? o.ShippingCountry,
      items,
      createdAt: o.createdAt ?? o.CreatedAt ?? '',
      updatedAt: o.updatedAt ?? o.UpdatedAt
    };
  }
}
