import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  userName?: string;
  userId?: string;

}
export interface LoginDto {
  email: string;
  password: string;
}
export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);

  registerUser(request: RegisterDto) {
    return this.http.post(`${environment.apiUrl}/Auth/register`, request, { withCredentials: true });
  }
  loginUser(request: LoginDto): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/Auth/login`,
      request,
      { withCredentials: true }
    );
  }
  logoutUser(): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/Auth/logout`,
      {},
      { withCredentials: true }
    );
  }
}

export function isProblemDetails(error: unknown): error is HttpErrorResponse & {
  error: ProblemDetails;
} {
  return error instanceof HttpErrorResponse && typeof error.error === 'object';
}
