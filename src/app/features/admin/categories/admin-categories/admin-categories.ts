import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, switchMap, of } from 'rxjs';

import {
  CategoriesApi,
  CategoryDto,
} from '../../../../core/categories/categories-api';

import { Button } from '../../../../shared/components/button/button';
import { CategoryCard } from '../../../../shared/components/category-card/category-card';

@Component({
  selector: 'app-admin-categories',
  imports: [Button, CategoryCard, ReactiveFormsModule],
  templateUrl: './admin-categories.html',
})
export class AdminCategories {
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly categories = signal<CategoryDto[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly pageSizeOptions = [10, 25, 50];

  protected readonly isCategoryModalOpen = signal(false);
  protected readonly editingCategoryId = signal<string | null>(null);

  protected readonly selectedImageFile = signal<File | null>(null);
  protected readonly imagePreviewUrl = signal<string | null>(null);
  protected readonly isImageMarkedForDeletion = signal(false);
  protected readonly imageError = signal<string | null>(null);
  protected readonly isUploading = signal(false);

  private previewObjectUrl: string | null = null;

  protected readonly totalPages = computed(() =>
    Math.ceil(this.categories().length / this.pageSize())
  );

  protected readonly paginatedCategories = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();

    return this.categories().slice(startIndex, endIndex);
  });

  protected readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoriesApi.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);

        const lastPage = Math.max(1, this.totalPages());

        if (this.currentPage() > lastPage) {
          this.currentPage.set(lastPage);
        }
      },
    });
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    input.value = '';

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    const maxFileSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.imageError.set('Only PNG, JPG and WEBP images are allowed.');
      return;
    }

    if (file.size > maxFileSize) {
      this.imageError.set('Image size must not exceed 5 MB.');
      return;
    }

    this.imageError.set(null);

    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
    }

    this.previewObjectUrl = URL.createObjectURL(file);
    this.selectedImageFile.set(file);
    this.imagePreviewUrl.set(this.previewObjectUrl);
    this.isImageMarkedForDeletion.set(false);
  }

  protected removeSelectedImage(): void {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }

    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.isImageMarkedForDeletion.set(false);
    this.imageError.set(null);
  }

  protected removeCurrentImage(): void {
    if (this.previewObjectUrl) {
      URL.revokeObjectURL(this.previewObjectUrl);
      this.previewObjectUrl = null;
    }

    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.imageError.set(null);

    this.isImageMarkedForDeletion.set(
      this.editingCategoryId() !== null
    );
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

  protected openCreateCategoryModal(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset();
    this.removeSelectedImage();
    this.isCategoryModalOpen.set(true);
  }

  protected startEditCategory(category: CategoryDto): void {
    this.removeSelectedImage();

    this.editingCategoryId.set(category.id);

    this.categoryForm.setValue({
      name: category.name,
    });

    this.imagePreviewUrl.set(category.imageUrl ?? null);
    this.isCategoryModalOpen.set(true);
  }

  protected cancelEditCategory(): void {
    this.removeSelectedImage();
    this.editingCategoryId.set(null);
    this.categoryForm.reset();
    this.isCategoryModalOpen.set(false);
  }

  protected saveCategory(): void {
    if (this.categoryForm.invalid || this.isUploading()) {
      return;
    }

    const request = this.categoryForm.getRawValue();
    const editingId = this.editingCategoryId();
    const file = this.selectedImageFile();
    const shouldDeleteImage = this.isImageMarkedForDeletion();

    this.imageError.set(null);
    this.isUploading.set(true);

    if (editingId) {
      this.categoriesApi
        .updateCategory(editingId, request)
        .pipe(
          switchMap(() => {
            if (file) {
              return this.categoriesApi.uploadCategoryImageViaSas(editingId, file);
            }

            if (shouldDeleteImage) {
              return this.categoriesApi.deleteCategoryImage(editingId);
            }

            return of(null);
          }),
          finalize(() => this.isUploading.set(false))
        )
        .subscribe({
          next: () => {
            this.cancelEditCategory();
            this.loadCategories();
          },
          error: (err) => {
            console.error('Failed to update category or image', err);
            this.imageError.set('Failed to save category changes. Please try again.');
          },
        });

      return;
    }

    this.categoriesApi
      .createCategory(request)
      .pipe(
        switchMap((createdCategory) => {
          if (file) {
            return this.categoriesApi.uploadCategoryImageViaSas(createdCategory, file);
          }

          return of(null);
        }),
        finalize(() => this.isUploading.set(false))
      )
      .subscribe({
        next: () => {
          this.cancelEditCategory();
          this.loadCategories();
        },
        error: (err) => {
          console.error('Failed to create category or upload image', err);
          this.imageError.set('Failed to create category or upload image. Please check the result before retrying.');
        },
      });
  }

  protected deleteCategory(category: CategoryDto): void {
    this.categoriesApi.deleteCategory(category.id).subscribe({
      next: () => {
        this.loadCategories();
      },
    });
  }
}