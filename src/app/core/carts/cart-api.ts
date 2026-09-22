import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface AddItemToCartDto {
    productId: string;
    quantity: number;
}
export interface CartItemDetailsDto {
    id: string;
    productId: string;
    name: string;
    sku: string;
    unitPrice: number;
    currency: string;
    quantity: number;
    imageUrl?: string | null;
}

export interface CartDetailsDto {
    cartId: string;
    items: CartItemDetailsDto[];
    totalAmount: number;
}

export interface UpdateCartItemQuantityDto {
    productId: string;
    quantity: number;
}
export interface ProblemDetails {
    title?: string;
    detail?: string;
    status?: number;
}



@Injectable({ providedIn: 'root' })
export class CartApi {
    private readonly http = inject(HttpClient);

    getCart(): Observable<CartDetailsDto> {
        return this.http.get<CartDetailsDto>(`${environment.apiUrl}/Cart`, { withCredentials: true });
    }

    updateQuantity(dto: UpdateCartItemQuantityDto): Observable<void> {
        return this.http.put<void>(`${environment.apiUrl}/Cart/items`, dto, {
            withCredentials: true,
        });
    }

    addItemToCart(request: AddItemToCartDto) {
        return this.http.post(`${environment.apiUrl}/Cart/items`, request, { withCredentials: true });
    }

    removeItem(itemId: string): Observable<string> {
        return this.http.delete<string>(`${environment.apiUrl}/Cart/items/${itemId}`, {
            withCredentials: true,
        });
    }

    checkout(): Observable<string> {
        return this.http.post<string>(`${environment.apiUrl}/Cart/checkout`, {}, {
            withCredentials: true,
        });
    }
}

export function isProblemDetails(error: unknown): error is HttpErrorResponse & {
    error: ProblemDetails;
} {
    return error instanceof HttpErrorResponse && typeof error.error === 'object';
}
