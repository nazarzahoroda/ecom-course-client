import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CategoriesApi,
  CategoryDto,
} from '../../../../core/categories/categories-api';
import {
  ProductDto,
  ProductImageDto,
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

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly pageSizeOptions = [10, 25, 50];

  protected readonly totalPages = computed(() =>
    Math.ceil(this.products().length / this.pageSize())
  );

  protected readonly paginatedProducts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();

    return this.products().slice(startIndex, endIndex);
  });

  protected readonly editingProductId = signal<string | null>(null);
  protected readonly isProductModalOpen = signal(false);

  protected readonly isImageModalOpen = signal(false);
  protected readonly selectedProductForImages = signal<ProductDto | null>(null);
  protected readonly currentProductImages = signal<ProductImageDto[]>([]);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isMainImage = signal<boolean>(false);
  protected readonly isUploadingImage = signal<boolean>(false);

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

        const lastPage = Math.max(1, this.totalPages());

        if (this.currentPage() > lastPage) {
          this.currentPage.set(lastPage);
        }
      },
    });
  }

  protected previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  protected changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const pageSize = Number(select.value);

    this.pageSize.set(pageSize);
    this.currentPage.set(1);
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

  protected openCreateProductModal(): void {
    this.editingProductId.set(null);
    this.productForm.reset();
    this.isProductModalOpen.set(true);
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

    this.isProductModalOpen.set(true);
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
            this.isProductModalOpen.set(false);
            this.editingProductId.set(null);
            this.productForm.reset();
            this.loadProducts();
          },
        });

      return;
    }

    this.productsApi.createProduct(request).subscribe({
      next: () => {
        this.isProductModalOpen.set(false);
        this.productForm.reset();
        this.loadProducts();
      },
    });
  }

  protected cancelEditProduct(): void {
    this.isProductModalOpen.set(false);
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
  protected openImagesModal(product: ProductDto): void {
    this.selectedProductForImages.set(product);
    this.selectedFile.set(null);
    this.isMainImage.set(false);
    this.isImageModalOpen.set(true);
    this.loadProductImages(product.id);
  }

  protected closeImagesModal(): void {
    this.isImageModalOpen.set(false);
    this.selectedProductForImages.set(null);
    this.currentProductImages.set([]);
    this.selectedFile.set(null);
  }

  private loadProductImages(productId: string): void {
    this.productsApi.getProductImages(productId).subscribe({
      next: (images) => this.currentProductImages.set(images),
      error: () => this.currentProductImages.set([]),
    });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    }
  }

  protected deleteImage(imageId: string): void {
    const product = this.selectedProductForImages();
    if (!product) return;

    this.productsApi.deleteProductImage(product.id, imageId).subscribe({
      next: () => {
        this.loadProductImages(product.id);
        this.loadProducts();
      },
    });
  }
  protected uploadImage(): void {
    const file = this.selectedFile();
    const product = this.selectedProductForImages();

    if (!file || !product) {
      return;
    }

    this.isUploadingImage.set(true);

    this.productsApi
      .uploadProductImageViaSas(product.id, file, this.isMainImage())
      .subscribe({
        next: (response) => {
          this.selectedFile.set(null);
          this.isMainImage.set(false);
          this.isUploadingImage.set(false);

          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }

          this.loadProductImages(product.id);
          this.loadProducts();
        },
        error: (err) => {
          console.error('Помилка під час завантаження через SAS:', err);
          this.isUploadingImage.set(false);
        }
      });
  }
}
