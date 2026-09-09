import { computed, inject, Injectable, signal } from "@angular/core";
import { catchError, Observable, of, tap } from "rxjs";
import { environment } from '../../../environments/environment';
import { HttpClient } from "@angular/common/http";

export interface UserProfile {
  userId: string;
  email: string;
  customerId: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  currentUser = signal<UserProfile | null>(null);
  
  isAuthenticated = computed(() => !!this.currentUser());

  checkAuthStatus(): Observable<UserProfile | null> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/Auth/me`, {
      withCredentials: true
    }).pipe(
      tap(profile => this.currentUser.set(profile)),
      catchError(() => {
        this.currentUser.set(null);
        return of(null);
      })
    );
  }
}