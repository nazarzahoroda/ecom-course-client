import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsApi } from '../../../core/products/products-api';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CurrencyPipe, RouterLink],
    templateUrl: './product-details.html',
    styleUrls: ['./product-details.scss']
})
export class ProductDetailsComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private productsApi = inject(ProductsApi);

    product = signal<any | null>(null);
    isLoading = signal<boolean>(true);
    errorMessage = signal<string | null>(null);

    ngOnInit(): void {
        const productId = this.route.snapshot.paramMap.get('id');

        if (productId) {
            this.productsApi.getProductById(productId).subscribe({
                next: (data) => {
                    this.product.set(data);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    console.error('Помилка:', err);
                    this.errorMessage.set('Не вдалося завантажити товар.');
                    this.isLoading.set(false);
                }
            });
        } else {
            this.errorMessage.set('Невірний ID товару.');
            this.isLoading.set(false);
        }
    }

    addToCart(productItem: any): void {
        console.log('Додано в кошик:', productItem);
    }
}