import { Component, inject, signal, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductsApi, ProductDto } from '../../../core/products/products-api';

@Component({
    selector: 'app-products-view',
    standalone: true,
    imports: [CurrencyPipe],
    templateUrl: './products-view.html',
    styleUrl: './products-view.scss',
})
export class ProductsView implements OnInit {
    private readonly productsApi = inject(ProductsApi);

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

    protected getCurrencyCode(currency: number): string {
        switch (currency) {
            case 0:
                return 'USD';
            case 1:
                return 'EUR';
            case 2:
                return 'UAH';
            default:
                return 'USD';
        }
    }

    protected addToCart(product: ProductDto): void {
        // Інтеграція з кошиком
        console.log('Додано в кошик:', product);
    }
}