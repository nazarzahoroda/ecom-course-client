import { Component, inject, signal } from '@angular/core';
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
  protected readonly editingCategoryId = signal<string | null>(null);

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
      },
    });
  }

  protected startEditCategory(category: CategoryDto): void {
    this.editingCategoryId.set(category.id);

    this.categoryForm.setValue({
      name: category.name,
    });
  }

  protected cancelEditCategory(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset();
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
            this.editingCategoryId.set(null);
            this.categoryForm.reset();
            this.loadCategories();
          },
        });

      return;
    }

    this.categoriesApi.createCategory(request).subscribe({
      next: () => {
        this.categoryForm.reset();
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
