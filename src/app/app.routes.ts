import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth-guard';
import { inject } from '@angular/core';
import { AuthService } from './core/auth/auth-service';

export const routes: Routes = [
  
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const authService = inject(AuthService);
      return authService.isAuthenticated() ? 'products' : 'login';
    },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/customers/register-customer/register-customer').then(
        (m) => m.RegisterCustomer,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/customers/login-customer/login-customer').then(
        (m) => m.LoginCustomer,
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products-view/products-view').then(
        (m) => m.ProductsView
      ),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-details/product-details').then(m => m.ProductDetailsComponent),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders-view/orders-view').then(
        (m) => m.OrdersView
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/carts/cart-view/cart-view').then(
        (m) => m.CartView
      ),
  },
];
