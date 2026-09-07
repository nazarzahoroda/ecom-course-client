import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'register',
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
];
