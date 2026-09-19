import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

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
  styleUrl: './admin-categories.scss',
})
export class AdminCategories {
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly categories = signal<CategoryDto[]>([]);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 5;

  protected readonly isCategoryModalOpen = signal(false);
  protected readonly editingCategoryId = signal<string | null>(null);

  protected readonly totalPages = computed(() =>
    Math.ceil(this.categories().length / this.pageSize)
  );

  protected readonly paginatedCategories = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

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

  protected openCreateCategoryModal(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset();
    this.isCategoryModalOpen.set(true);
  }

  protected startEditCategory(category: CategoryDto): void {
    this.editingCategoryId.set(category.id);

    this.categoryForm.setValue({
      name: category.name,
    });

    this.isCategoryModalOpen.set(true);
  }

  protected cancelEditCategory(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset();
    this.isCategoryModalOpen.set(false);
  }

  protected createCategory(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    const request = this.categoryForm.getRawValue();
    const editingCategoryId = this.editingCategoryId();

    if (editingCategoryId) {
      this.categoriesApi
        .updateCategory(editingCategoryId, request)
        .subscribe({
          next: () => {
            this.cancelEditCategory();
            this.loadCategories();
          },
        });

      return;
    }

    this.categoriesApi.createCategory(request).subscribe({
      next: () => {
        this.cancelEditCategory();
        this.loadCategories();
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
