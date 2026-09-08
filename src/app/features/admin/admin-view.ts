import { Component, inject, signal } from '@angular/core';
import {
  CategoriesApi,
  CategoryDto,
} from '../../core/categories/categories-api';
import {
  ProductDto,
  ProductsApi,
} from '../../core/products/products-api';

@Component({
  selector: 'app-admin-view',
  templateUrl: './admin-view.html',
})
export class AdminView {
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly productsApi = inject(ProductsApi);

  protected readonly categories = signal<CategoryDto[]>([]);
  protected readonly products = signal<ProductDto[]>([]);

  constructor() {
    this.categoriesApi.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
    });

    this.productsApi.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
      },
    });
  }

  protected getCurrencyName(currency: number): string {
    switch (currency) {
      case 0:
        return 'USD';
      case 1:
        return 'EUR';
      case 2:
        return 'UAH';
      default:
        return 'Unknown';
    }
  }

  protected getCategoryName(categoryId: string): string {
    return (
      this.categories().find((category) => category.id === categoryId)?.name ??
      'Unknown category'
    );
  }
}
