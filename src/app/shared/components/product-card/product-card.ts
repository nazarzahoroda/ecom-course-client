import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductDto } from '../../../core/products/products-api';
import { CartApi } from '../../../core/carts/cart-api';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<ProductDto>();
  readonly id = input.required<string>();
  readonly name = input.required<string>();
  readonly amount = input.required<number>();
  readonly currency = input.required<string>();
  readonly imageUrl = input.required<string>();

  private readonly cartApi = inject(CartApi);


  protected addToCart(product: ProductDto): void {
    this.cartApi.addItemToCart({ productId: product.id, quantity: 1 }).subscribe({
      next: () => {
        console.log(`Товар ${product.name} додано до кошика`);
      },

    });
  }
}
