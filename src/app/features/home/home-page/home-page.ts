import { Component, inject, signal } from '@angular/core';

import { CategoriesApi, CategoryDto } from '../../../core/categories/categories-api';
import { getCurrencyCode, ProductDto, ProductsApi } from '../../../core/products/products-api';
import { StorefrontCategoryCard } from '../../../shared/components/storefront-category-card/storefront-category-card';
import { ProductCard } from '../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home-page',
  imports: [StorefrontCategoryCard, ProductCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly productsApi = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  protected readonly getCurrencyCode = getCurrencyCode;

  protected readonly products = signal<ProductDto[]>([]);
  protected readonly categories = signal<CategoryDto[]>([]);

  constructor() {
    this.productsApi.getTopProducts().subscribe(products => {
      this.products.set(products);
    });

    this.categoriesApi.getTopCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }
}