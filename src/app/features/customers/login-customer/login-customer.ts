import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthApi, isProblemDetails } from '../../../core/auth/auth-api';
import { AuthService } from '../../../core/auth/auth-service';
import { CartStateService } from '../../../core/carts/cart-state.service';

@Component({
  selector: 'app-login-customer',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-customer.html',
  styleUrl: './login-customer.scss',
})
export class LoginCustomer {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly cartState = inject(CartStateService);

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authApi
      .loginUser({ ...this.form.getRawValue() })
      .subscribe({
        next: () => {
          this.authService.checkAuthStatus().subscribe({
            next: () => {
              const isAdmin =
                this.authService.currentUser()?.roles.includes('Admin') ?? false;

              this.submitting.set(false);
              this.form.reset();

              this.router.navigate(isAdmin ? ['/admin/products'] : ['/']);
            },
            error: () => {
              this.submitting.set(false);
            },
          });
        },

        error: (error: unknown) => {
          this.submitting.set(false);
          this.errorMessage.set(
            isProblemDetails(error)
              ? error.error.detail ?? 'Login failed.'
              : 'Could not reach the server.',
          );
        },
      });
  }
}
