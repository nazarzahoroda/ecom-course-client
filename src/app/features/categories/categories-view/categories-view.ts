import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  CategoriesApi,
  CategoryDto,
} from '../../../core/categories/categories-api';

import { StorefrontCategoryCard } from '../../../shared/components/storefront-category-card/storefront-category-card';

@Component({
  selector: 'app-categories-view',
  standalone: true,
  imports: [StorefrontCategoryCard],
  templateUrl: './categories-view.html',
})
export class CategoriesView implements OnInit {
  private readonly categoriesApi = inject(CategoriesApi);

  protected readonly categories = signal<CategoryDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly pageSizeOptions = [10, 25, 50];

  protected readonly totalPages = computed(() =>
    Math.ceil(this.categories().length / this.pageSize())
  );

  protected readonly paginatedCategories = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();

    return this.categories().slice(startIndex, endIndex);
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.categoriesApi.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);

        const lastPage = Math.max(1, this.totalPages());

        if (this.currentPage() > lastPage) {
          this.currentPage.set(lastPage);
        }

        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Не вдалося завантажити категорії');
        this.loading.set(false);
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

    this.pageSize.set(Number(select.value));
    this.currentPage.set(1);
  }
}