import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
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
    images?: ProductImageDto[];
}

export interface ProductRequest {
    name: string;
    amount: number;
    currency: number;
    sku: string;
    categoryId: string;
    images?: ProductImageDto[];
}

export interface ProductImageDto {
    id: string;
    productId: string;
    url?: string;
    isMain: boolean;
}
export interface InitiateUploadResponse {
    uploadUrl: string;
    blobName: string;
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

    getProductImages(productId: string): Observable<ProductImageDto[]> {
        return this.http.get<ProductImageDto[]>(
            `${environment.apiUrl}/ProductImages/${productId}`,
            { withCredentials: true }
        );
    }

    deleteProductImage(productId: string, imageId: string): Observable<void> {
        return this.http.delete<void>(
            `${environment.apiUrl}/ProductImages/${imageId}`,
            {
                params: { productId },
                withCredentials: true
            }
        );
    }

    initiateProductImageUpload(
        productId: string,
        fileName: string,
        contentType: string
    ): Observable<InitiateUploadResponse> {
        return this.http.post<InitiateUploadResponse>(
            `${environment.apiUrl}/ProductImages/${productId}/initiate-upload`,
            { fileName, contentType },
            { withCredentials: true }
        );
    }

    uploadToAzureBlob(uploadUrl: string, file: File): Observable<void> {
        const headers = new HttpHeaders({
            'x-ms-blob-type': 'BlockBlob',
            'Content-Type': file.type
        });
        return this.http.put<void>(uploadUrl, file, { headers });
    }

    confirmProductImageUpload(
        productId: string,
        blobName: string,
        contentType: string,
        isMain: boolean
    ): Observable<{ imageId: string }> {
        return this.http.post<{ imageId: string }>(
            `${environment.apiUrl}/ProductImages/${productId}/confirm-upload`,
            { blobName, contentType, isMain },
            { withCredentials: true }
        );
    }

    uploadProductImageViaSas(productId: string, file: File, isMain: boolean = false): Observable<{ imageId: string }> {
        return this.initiateProductImageUpload(productId, file.name, file.type).pipe(
            switchMap(res =>
                this.uploadToAzureBlob(res.uploadUrl, file).pipe(
                    switchMap(() => this.confirmProductImageUpload(productId, res.blobName, file.type, isMain))
                )
            )
        );
    }
}
