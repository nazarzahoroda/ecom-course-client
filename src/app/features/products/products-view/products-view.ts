import { Component, computed, inject, OnInit, signal } from '@angular/core';

import {
    ProductsApi,
    ProductDto,
    getCurrencyCode,
} from '../../../core/products/products-api';

import { ProductCard } from '../../../shared/components/product-card/product-card';

@Component({
    selector: 'app-products-view',
    standalone: true,
    imports: [ProductCard],
    templateUrl: './products-view.html',
})
export class ProductsView implements OnInit {
    private readonly productsApi = inject(ProductsApi);

    protected readonly getCurrencyCode = getCurrencyCode;

    protected readonly products = signal<ProductDto[]>([]);
    protected readonly loading = signal(true);
    protected readonly errorMessage = signal<string | null>(null);

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

    ngOnInit(): void {
        this.loadProducts();
    }

    protected loadProducts(): void {
        this.loading.set(true);
        this.errorMessage.set(null);

        this.productsApi.getProducts().subscribe({
            next: (data) => {
                this.products.set(data);

                const lastPage = Math.max(1, this.totalPages());

                if (this.currentPage() > lastPage) {
                    this.currentPage.set(lastPage);
                }

                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё С‚РѕРІР°СЂРё');
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
