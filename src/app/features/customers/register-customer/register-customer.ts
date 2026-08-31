import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomersApi, isProblemDetails } from '../../../core/customers/customers-api';

@Component({
  selector: 'app-register-customer',
  imports: [ReactiveFormsModule],
  templateUrl: './register-customer.html',
  styleUrl: './register-customer.scss',
})
export class RegisterCustomer {
  private readonly fb = inject(FormBuilder);
  private readonly customersApi = inject(CustomersApi);

  protected readonly userId = signal(crypto.randomUUID());
  protected readonly submitting = signal(false);
  protected readonly registeredId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    street: ['', [Validators.required, Validators.maxLength(200)]],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    postalCode: ['', [Validators.required, Validators.maxLength(30)]],
    country: ['', [Validators.required, Validators.maxLength(100)]],
  });

  protected regenerateUserId(): void {
    this.userId.set(crypto.randomUUID());
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.registeredId.set(null);

    this.customersApi
      .registerCustomer({ userId: this.userId(), ...this.form.getRawValue() })
      .subscribe({
        next: (id) => {
          this.submitting.set(false);
          this.registeredId.set(id);
          this.form.reset();
          this.regenerateUserId();
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
