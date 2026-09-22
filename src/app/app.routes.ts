import { Routes } from '@angular/router';
import { StorefrontLayout } from './layouts/storefront/storefront-layout/storefront-layout';

import { authGuard } from './core/auth/auth-guard';
import { adminGuard } from './core/auth/admin-guard';

export const routes: Routes = [
  {
    path: '',
    component: StorefrontLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home-page/home-page').then(
            (m) => m.HomePage,
          ),
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
            (m) => m.ProductsView,
          ),
      },
      {
        path: 'customer',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/customers/customer-view/customer-view').then(
            (m) => m.CustomerView,
          ),
      },
    ],
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-details/product-details').then(
        (m) => m.ProductDetailsComponent,
      ),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/orders-view/orders-view').then(
        (m) => m.OrdersView,
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./features/carts/cart-view/cart-view').then(
        (m) => m.CartView,
      ),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-view').then((m) => m.AdminView),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'products',
      },
      {
        path: 'products',
        loadComponent: () =>
          import(
            './features/admin/products/admin-products/admin-products'
          ).then((m) => m.AdminProducts),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import(
            './features/admin/categories/admin-categories/admin-categories'
          ).then((m) => m.AdminCategories),
      },
    ],
  },
];
