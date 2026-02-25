import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InstructorPaymentMethodDto } from './events.service';

const BASE = '/users/me/payment-methods';

/** Request body for POST/PUT payment method. */
export interface CreateOrUpdatePaymentMethodRequest {
  paymentType: 'bit' | 'bank_transfer';
  isDefault?: boolean;
  phoneNumber?: string | null;
  bankName?: string | null;
  accountHolderName?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  swiftBic?: string | null;
  bankAddress?: string | null;
  bankNumber?: string | null;
  branchName?: string | null;
  branchNumber?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** GET /api/users/me/payment-methods — list current user's payment methods (auth required). */
  getMyPaymentMethods(): Observable<InstructorPaymentMethodDto[]> {
    return this.http.get<InstructorPaymentMethodDto[]>(`${this.apiUrl}${BASE}`);
  }

  /** GET /api/users/me/payment-methods/{id} — get one (must belong to current user). */
  getById(id: number): Observable<InstructorPaymentMethodDto> {
    return this.http.get<InstructorPaymentMethodDto>(`${this.apiUrl}${BASE}/${id}`);
  }

  /** POST /api/users/me/payment-methods — add payment method. */
  create(request: CreateOrUpdatePaymentMethodRequest): Observable<InstructorPaymentMethodDto> {
    return this.http.post<InstructorPaymentMethodDto>(`${this.apiUrl}${BASE}`, request);
  }

  /** PUT /api/users/me/payment-methods/{id} — update (must belong to current user). */
  update(id: number, request: CreateOrUpdatePaymentMethodRequest): Observable<InstructorPaymentMethodDto> {
    return this.http.put<InstructorPaymentMethodDto>(`${this.apiUrl}${BASE}/${id}`, request);
  }

  /** DELETE /api/users/me/payment-methods/{id} — soft-delete (must belong to current user). */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${BASE}/${id}`);
  }
}
