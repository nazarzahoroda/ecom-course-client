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
      this.errorMessage.set('РќРµРІС–СЂРЅРёР№ ID С‚РѕРІР°СЂСѓ.');
      this.isLoading.set(false);
      return;
    }

    this.productsApi.getProductById(productId).subscribe({
      next: (product) => {
        this.product.set(product);

        const mainImageIndex = product.images?.findIndex(image => image.isMain) ?? -1;

        this.selectedImageIndex.set(mainImageIndex >= 0 ? mainImageIndex : 0);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('РџРѕРјРёР»РєР°:', error);
        this.errorMessage.set('РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё С‚РѕРІР°СЂ.');
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

  selectedImageIndex = signal<number>(0);

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  prevImage(total: number): void {
    this.selectedImageIndex.update(idx => (idx === 0 ? total - 1 : idx - 1));
  }

  nextImage(total: number): void {
    this.selectedImageIndex.update(idx => (idx === total - 1 ? 0 : idx + 1));
  }
}
