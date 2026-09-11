import { Component, inject, signal, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { getCurrencyCode, ProductsApi, ProductDto } from '../../../core/products/products-api';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-products-view',
    standalone: true,
    imports: [CurrencyPipe, RouterLink],
    templateUrl: './products-view.html',
    styleUrl: './products-view.scss',
})
export class ProductsView implements OnInit {
    private readonly productsApi = inject(ProductsApi);
    protected readonly getCurrencyCode = getCurrencyCode;

    protected readonly products = signal<ProductDto[]>([]);
    protected readonly loading = signal(true);
    protected readonly errorMessage = signal<string | null>(null);

    ngOnInit(): void {
        this.loadProducts();
    }

    protected loadProducts(): void {
        this.loading.set(true);
        this.productsApi.getProducts().subscribe({
            next: (data) => {
                this.products.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Не вдалося завантажити товари');
                this.loading.set(false);
            },
        });
    }

    protected addToCart(product: ProductDto): void {
        console.log('Додано в кошик:', product);
    }
}