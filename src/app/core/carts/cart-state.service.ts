import { Injectable, computed, inject, signal } from '@angular/core';

import { CartApi, CartDetailsDto } from './cart-api';

@Injectable({ providedIn: 'root' })
export class CartStateService {
    private readonly cartApi = inject(CartApi);

    private readonly cart = signal<CartDetailsDto | null>(null);

    readonly totalItems = computed(() =>
        this.cart()?.items.reduce((total, item) => total + item.quantity, 0) ?? 0
    );

    loadCart(): void {
        this.cartApi.getCart().subscribe({
            next: (cart) => {
                this.cart.set(cart);
            },
            error: () => {
                this.cart.set(null);
            },
        });
    }

    refresh(): void {
        this.loadCart();
    }

    clear(): void {
        this.cart.set(null);
    }

    isProductInCart(productId: string): boolean {
        return this.cart()?.items.some((item) => item.productId === productId) ?? false;
    }
}