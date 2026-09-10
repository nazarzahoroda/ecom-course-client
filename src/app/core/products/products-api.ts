import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProductDto {
    id: string;
    name: string;
    amount: number;
    currency: string;
    sku: string;
    categoryId: string;
}

@Injectable({ providedIn: 'root' })
export class ProductsApi {
    private readonly http = inject(HttpClient);

    getProducts(): Observable<ProductDto[]> {
        return this.http.get<ProductDto[]>(`${environment.apiUrl}/Products`);
    }

    getProductById(id: string): Observable<ProductDto> {
        return this.http.get<ProductDto>(`${environment.apiUrl}/Products/${id}`);
    }
}