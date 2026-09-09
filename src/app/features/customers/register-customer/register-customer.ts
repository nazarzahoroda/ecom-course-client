import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi, isProblemDetails } from '../../../core/auth/auth-api';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-customer',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-customer.html',
  styleUrl: './register-customer.scss',
})
export class RegisterCustomer {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    street: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    postalCode: ['', [Validators.required, Validators.maxLength(30)]],
    country: ['', [Validators.required, Validators.maxLength(100)]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    this.authApi
      .registerUser({...this.form.getRawValue() })
      .subscribe({
        next: (x) => {
          this.submitting.set(false);
          this.form.reset();
          this.router.navigate(['/login']);
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.errorMessage.set(
            isProblemDetails(error) ? error.error.detail ?? 'Registration failed.' : 'Could not reach the server.',
          );
        },
      }); 
  }
}
