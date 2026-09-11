import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export enum Currency {
    USD,
    EUR,
    UAH,
}

export function getCurrencyCode(currency: Currency): string {
    return Currency[currency];
}

export interface ProductDto {
    id: string;
    name: string;
    amount: number;
    currency: Currency;
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
}