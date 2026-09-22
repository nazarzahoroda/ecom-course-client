import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthApi } from './auth-api';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthApi);
    const router = inject(Router);

    const authReq = req.clone({
        withCredentials: true,
    });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            const url = req.url.toLowerCase();
            if (error.status !== 401 || url.includes('/auth/refresh') || url.includes('/auth/login')) {
                return throwError(() => error);
            }

            if (isRefreshing) {
                return refreshTokenSubject.pipe(
                    filter((result) => result !== null),
                    take(1),
                    switchMap(() => next(authReq))
                );
            }

            isRefreshing = true;
            refreshTokenSubject.next(null);

            return authService.refreshToken().pipe(
                switchMap(() => {
                    isRefreshing = false;
                    refreshTokenSubject.next(true);
                    return next(authReq);
                }),
                catchError((refreshError) => {
                    isRefreshing = false;
                    refreshTokenSubject.next(false);
                    router.navigate(['/login']);
                    return throwError(() => refreshError);
                })
            );
        })
    );
};