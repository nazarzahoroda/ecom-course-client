import { Component, OnInit, inject, signal } from '@angular/core';
import { CartStateService } from '../../../core/carts/cart-state.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  ProductDto,
  ProductsApi,
  getCurrencyCode,
} from '../../../core/products/products-api';

import { CartApi } from '../../../core/carts/cart-api';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductsApi);
  private readonly cartApi = inject(CartApi);
  private readonly cartState = inject(CartStateService);

  protected readonly getCurrencyCode = getCurrencyCode;

  protected readonly product = signal<ProductDto | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isAddedToCart = signal(false);

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (!productId) {
      this.errorMessage.set('Невірний ID товару.');
      this.isLoading.set(false);
      return;
    }

    this.productsApi.getProductById(productId).subscribe({
      next: (product) => {
        this.product.set(product);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Помилка:', error);
        this.errorMessage.set('Не вдалося завантажити товар.');
        this.isLoading.set(false);
      },
    });
  }

  protected addToCart(product: ProductDto): void {
    this.cartApi
      .addItemToCart({ productId: product.id, quantity: 1 })
      .subscribe({
        next: () => {
          this.isAddedToCart.set(true);
          this.cartState.refresh();
        },
        error: (error) => {
          console.error('Failed to add product to cart:', error);
        },
      });
  }
}
