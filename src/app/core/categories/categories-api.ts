import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface CategoryDto {
  id: string;
  name: string;
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
}
