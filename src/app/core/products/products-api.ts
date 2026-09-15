import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum Currency {
    USD,
    EUR,
    UAH,
}

export function getCurrencyCode(currency: number): string {
    return Currency[currency] ?? 'USD';
}

export interface ProductDto {
    id: string;
    name: string;
    amount: number;
    currency: number;
    sku: string;
    categoryId: string;
}

export interface ProductRequest {
    name: string;
    amount: number;
    currency: number;
    sku: string;
    categoryId: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
    private readonly http = inject(HttpClient);

    getProducts(): Observable<ProductDto[]> {
        return this.http.get<ProductDto[]>(`${environment.apiUrl}/Products`);
    }

    getTopProducts(): Observable<ProductDto[]> {
        return this.http.get<ProductDto[]>(`${environment.apiUrl}/Products/top`);
    }

    getProductById(id: string): Observable<ProductDto> {
        return this.http.get<ProductDto>(`${environment.apiUrl}/Products/${id}`);
    }

    createProduct(request: ProductRequest): Observable<string> {
        return this.http.post<string>(
            `${environment.apiUrl}/Products`,
            request,
            { withCredentials: true },
        );
    }

    updateProduct(id: string, request: ProductRequest): Observable<void> {
        return this.http.put<void>(
            `${environment.apiUrl}/Products/${id}`,
            request,
            { withCredentials: true },
        );
    }

    deleteProduct(id: string): Observable<void> {
        return this.http.delete<void>(
            `${environment.apiUrl}/Products/${id}`,
            { withCredentials: true },
        );
    }
}
