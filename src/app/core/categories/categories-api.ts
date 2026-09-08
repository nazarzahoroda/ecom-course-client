import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface CategoryDto {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  private readonly http = inject(HttpClient);

  getCategories(): Observable<CategoryDto[]> {
    return this.http.get<CategoryDto[]>(`${environment.apiUrl}/Categories`);
  }
}
