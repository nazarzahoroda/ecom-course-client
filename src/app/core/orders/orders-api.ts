import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export type OrderStatus = 'Pending' | 'Paid' | 'Cancelled';

export interface OrderLineDto {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDto {
  id: string;
  customerId: string;
  status: OrderStatus;
  total: number;
  lines: OrderLineDto[];
}

export interface OrdersPageDto {
  orders: OrderDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
}

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private readonly http = inject(HttpClient);

  getOrders(page: number, pageSize: number): Observable<OrdersPageDto> {
    return this.http.get<OrdersPageDto>(`${environment.apiUrl}/Orders`, {
      params: { page, pageSize },
      withCredentials: true,
    });
  }

  payOrder(id: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/Orders/${id}/pay`, null, {
      withCredentials: true,
    });
  }

  cancelOrder(id: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/Orders/${id}/cancel`, null, {
      withCredentials: true,
    });
  }
}

export function isProblemDetails(error: unknown): error is HttpErrorResponse & {
  error: ProblemDetails;
} {
  return error instanceof HttpErrorResponse && typeof error.error === 'object';
}
