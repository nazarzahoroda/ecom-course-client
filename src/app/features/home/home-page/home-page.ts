import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ProductsApi,
  ProductDto,
} from '../../../core/products/products-api';

import {
  CategoriesApi,
  CategoryDto,
} from '../../../core/categories/categories-api';

import { StorefrontCategoryCard } from '../../../shared/components/storefront-category-card/storefront-category-card';
import { ProductCard } from '../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    StorefrontCategoryCard,
    ProductCard,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly productsApi = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);

  protected readonly categories = signal<CategoryDto[]>([]);
  protected readonly products = signal<ProductDto[]>([]);

  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadHomeData();
  }

  private loadHomeData(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.categoriesApi.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories.slice(0, 4));
      },
      error: () => {
        this.errorMessage.set('Не вдалося завантажити категорії');
        this.loading.set(false);
      },
    });

    this.productsApi.getProducts().subscribe({
      next: (products) => {
        this.products.set(products.slice(0, 4));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Не вдалося завантажити товари');
        this.loading.set(false);
      },
    });
  }
}

