import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface RegisterCustomerRequest {
  userId: string;
  name: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
}

@Injectable({ providedIn: 'root' })
export class CustomersApi {
  private readonly http = inject(HttpClient);

  registerCustomer(request: RegisterCustomerRequest): Observable<string> {
    return this.http.post<string>(`${environment.apiUrl}/customers/register`, request);
  }
}

export function isProblemDetails(error: unknown): error is HttpErrorResponse & {
  error: ProblemDetails;
} {
  return error instanceof HttpErrorResponse && typeof error.error === 'object';
}
