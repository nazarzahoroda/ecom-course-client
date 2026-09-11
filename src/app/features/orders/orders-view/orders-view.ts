import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';

import { OrderDto, OrdersApi, OrderStatus } from '../../../core/orders/orders-api';
import { ProductDto, ProductsApi } from '../../../core/products/products-api';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-orders-view',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './orders-view.html',
  styleUrl: './orders-view.scss',
})
export class OrdersView implements OnInit {
  private readonly ordersApi = inject(OrdersApi);
  private readonly productsApi = inject(ProductsApi);

  protected readonly orders = signal<OrderDto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly expandedOrderId = signal<string | null>(null);
  protected readonly pendingActionOrderId = signal<string | null>(null);

  private readonly productNamesById = signal<Map<string, string>>(new Map());

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)),
  );

  ngOnInit(): void {
    this.loadOrders(1);
  }

  protected loadOrders(page: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      ordersPage: this.ordersApi.getOrders(page, PAGE_SIZE),
      products: this.productsApi.getProducts(),
    }).subscribe({
      next: ({ ordersPage, products }) => {
        this.orders.set(ordersPage.orders);
        this.totalCount.set(ordersPage.totalCount);
        this.page.set(ordersPage.page);
        this.productNamesById.set(this.toProductNameMap(products));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load order history.');
        this.loading.set(false);
      },
    });
  }

  protected toggleExpanded(orderId: string): void {
    this.expandedOrderId.set(this.expandedOrderId() === orderId ? null : orderId);
  }

  protected productName(productId: string): string {
    return this.productNamesById().get(productId) ?? `Product ${productId.slice(0, 8)}`;
  }

  protected canPay(status: OrderStatus): boolean {
    return status === 'Pending';
  }

  protected canCancel(status: OrderStatus): boolean {
    return status === 'Pending';
  }

  protected pay(order: OrderDto): void {
    this.runAction(order, () => this.ordersApi.payOrder(order.id), 'Paid');
  }

  protected cancel(order: OrderDto): void {
    this.runAction(order, () => this.ordersApi.cancelOrder(order.id), 'Cancelled');
  }

  private runAction(
    order: OrderDto,
    action: () => Observable<void>,
    nextStatus: OrderStatus,
  ): void {
    this.pendingActionOrderId.set(order.id);
    action().subscribe({
      next: () => {
        this.orders.update((current) =>
          current.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)),
        );
        this.pendingActionOrderId.set(null);
      },
      error: () => {
        this.errorMessage.set('Failed to complete the order action.');
        this.pendingActionOrderId.set(null);
      },
    });
  }

  private toProductNameMap(products: ProductDto[]): Map<string, string> {
    return new Map(products.map((product) => [product.id, product.name]));
  }
}
