import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CategoriesApi,
  CategoryDto,
} from '../../../../core/categories/categories-api';
import {
  ProductDto,
  ProductsApi,
} from '../../../../core/products/products-api';

import { Button } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-admin-products',
  imports: [Button, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss',
})
export class AdminProducts {
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly productsApi = inject(ProductsApi);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly categories = signal<CategoryDto[]>([]);
  protected readonly products = signal<ProductDto[]>([]);

  protected readonly editingProductId = signal<string | null>(null);

  protected readonly productForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    amount: [null as number | null, Validators.required],
    currency: [null as number | null, Validators.required],
    sku: ['', Validators.required],
    categoryId: [null as string | null, Validators.required],
  });

  constructor() {
    this.loadCategories();
    this.loadProducts();
  }

  private loadCategories(): void {
    this.categoriesApi.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
    });
  }

  private loadProducts(): void {
    this.productsApi.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
      },
    });
  }

  protected getCategoryName(categoryId: string): string {
    return (
      this.categories().find((category) => category.id === categoryId)?.name ??
      'Unknown category'
    );
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

  protected startEditProduct(product: ProductDto): void {
    this.editingProductId.set(product.id);

    this.productForm.setValue({
      name: product.name,
      amount: product.amount,
      currency: product.currency,
      sku: product.sku,
      categoryId: product.categoryId,
    });
  }

  protected createProduct(): void {
    if (this.productForm.invalid) {
      return;
    }

    const request = {
      name: this.productForm.controls.name.value!,
      amount: this.productForm.controls.amount.value!,
      currency: this.productForm.controls.currency.value!,
      sku: this.productForm.controls.sku.value!,
      categoryId: this.productForm.controls.categoryId.value!,
    };

    const editingProductId = this.editingProductId();

    if (editingProductId) {
      this.productsApi
        .updateProduct(editingProductId, request)
        .subscribe({
          next: () => {
            this.editingProductId.set(null);
            this.productForm.reset();
            this.loadProducts();
          },
        });

      return;
    }

    this.productsApi.createProduct(request).subscribe({
      next: () => {
        this.productForm.reset();
        this.loadProducts();
      },
    });
  }

  protected cancelEditProduct(): void {
    this.editingProductId.set(null);
    this.productForm.reset();
  }

  protected deleteProduct(product: ProductDto): void {
    this.productsApi.deleteProduct(product.id).subscribe({
      next: () => {
        this.loadProducts();
      },
    });
  }
}
