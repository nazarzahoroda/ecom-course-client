import { Component, inject, OnInit, signal } from '@angular/core';

import { AuthService } from '../../../core/auth/auth-service';
import {
    CustomerResponse,
    CustomersApi,
} from '../../../core/customers/customers-api';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-customer-view',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './customer-view.html',
})
export class CustomerView implements OnInit {
    private readonly authService = inject(AuthService);
    private readonly customersApi = inject(CustomersApi);

    protected readonly customer = signal<CustomerResponse | null>(null);
    protected readonly loading = signal(true);
    protected readonly errorMessage = signal<string | null>(null);

    ngOnInit(): void {
        this.loadCustomer();
    }

    private loadCustomer(): void {
        const customerId = this.authService.currentUser()?.customerId;

        if (!customerId) {
            this.errorMessage.set('Customer information is unavailable.');
            this.loading.set(false);
            return;
        }

        this.customersApi.getCustomerById(customerId).subscribe({
            next: (customer) => {
                this.customer.set(customer);
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Failed to load customer information.');
                this.loading.set(false);
            },
        });
    }
}