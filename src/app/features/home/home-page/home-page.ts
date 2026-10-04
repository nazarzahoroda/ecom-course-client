import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ProductDto,
  ProductsApi,
  getCurrencyCode,
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
})
export class HomePage implements OnInit {
  private readonly productsApi = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);

  protected readonly getCurrencyCode = getCurrencyCode;

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

    this.categoriesApi.getTopCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: () => {
        this.errorMessage.set('РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РєР°С‚РµРіРѕСЂС–С—');
        this.loading.set(false);
      },
    });

    this.productsApi.getTopProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё С‚РѕРІР°СЂРё');
        this.loading.set(false);
      },
    });
  }
}
