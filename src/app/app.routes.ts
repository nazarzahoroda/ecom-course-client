import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'customers/register',
  },
  {
    path: 'customers/register',
    loadComponent: () =>
      import('./features/customers/register-customer/register-customer').then(
        (m) => m.RegisterCustomer,
      ),
  },
];
