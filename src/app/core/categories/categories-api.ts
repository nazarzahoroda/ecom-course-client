import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { InitiateUploadResponse } from '../products/products-api';

export interface CategoryDto {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface CategoryRequest {
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${environment.apiUrl}/Categories`);
  }

  getTopCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(
      `${environment.apiUrl}/categories/top`,
    );
  }

  getCategoryById(id: string): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(
      `${environment.apiUrl}/Categories/${id}`,
    );
  }

  createCategory(request: CategoryRequest): Observable<string> {
    return this.http.post<string>(
      `${environment.apiUrl}/Categories`,
      request,
      { withCredentials: true },
    );
  }

  updateCategory(id: string, request: CategoryRequest): Observable<void> {
    return this.http.put<void>(
      `${environment.apiUrl}/Categories/${id}`,
      request,
      { withCredentials: true },
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/Categories/${id}`,
      { withCredentials: true },
    );
  }


  initiateCategoryImageUpload(
        categoryId: string,
        fileName: string,
        contentType: string
    ): Observable<InitiateUploadResponse> {
        return this.http.post<InitiateUploadResponse>(
            `${environment.apiUrl}/CategoryImages/${categoryId}/initiate-upload`,
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

    confirmCategoryImageUpload(
        categoryId: string,
        blobName: string
    ): Observable<void> {
        return this.http.post<void>(
            `${environment.apiUrl}/CategoryImages/${categoryId}/confirm-upload`,
            { blobName },
            { withCredentials: true }
        );
    }

    uploadCategoryImageViaSas(categoryId: string, file: File): Observable<void> {
        return this.initiateCategoryImageUpload(categoryId, file.name, file.type).pipe(
            switchMap(res =>
                this.uploadToAzureBlob(res.uploadUrl, file).pipe(
                    switchMap(() => this.confirmCategoryImageUpload(categoryId, res.blobName))
                )
            )
        );
    }

    deleteCategoryImage(categoryId: string): Observable<void> {
        return this.http.delete<void>(
            `${environment.apiUrl}/CategoryImages/${categoryId}`,
            {
                params: { categoryId },
                withCredentials: true
            }
        );
    }
}
