import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartApi, CartItemDetailsDto, UpdateCartItemQuantityDto } from '../../../core/carts/cart-api';

export interface CartItemModel {
  id: string;
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
}

@Component({
  selector: 'app-cart-view',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart-view.html',
})
export class CartView implements OnInit {
  private readonly cartApi = inject(CartApi);
  private readonly router = inject(Router);
  cartItems = signal<CartItemDetailsDto[]>([]);
  totalAmount = signal<number>(0);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isCheckingOut = signal(false);

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.cartApi.getCart().subscribe({
      next: (cart) => {
        this.cartItems.set(cart.items ?? []);
        this.totalAmount.set(cart.totalAmount ?? 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load shopping cart.');
        this.isLoading.set(false);
      },
    });
  }
changeQuantity(item: CartItemDetailsDto, delta: number) {
  const newQty = item.quantity + delta;
  if (newQty <= 0) {
    this.removeItem(item.id);
    return;
  }

  const payload: UpdateCartItemQuantityDto = {
    productId: item.productId, 
    quantity: newQty,
  };

  this.cartApi.updateQuantity(payload).subscribe({
    next: () => {
      this.cartItems.update((items) =>
        items.map((i) => (i.id === item.id ? { ...i, quantity: newQty } : i))
      );
      this.recalculateTotal();
    },
    error: (err) => {
      this.errorMessage.set(err?.error?.detail || 'Не вдалося оновити кількість.');
    },
  });
}

removeItem(itemId: string) {
    this.cartApi.removeItem(itemId).subscribe({
      next: () => {
        this.cartItems.update((items) => items.filter((i) => i.id !== itemId));
        this.recalculateTotal();
      },
      error: () => {
        this.errorMessage.set('Failed to remove item.');
      },
    });
  }

onCheckout() {
    if (this.cartItems().length === 0 || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.cartApi.checkout().subscribe({
      next: (orderId) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.detail || 'Checkout failed. Please try again.');
      },
    });
  }
  private recalculateTotal() {
    const sum = this.cartItems().reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0
    );
    this.totalAmount.set(sum);
  }
}