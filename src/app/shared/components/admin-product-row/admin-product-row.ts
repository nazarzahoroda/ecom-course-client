import { Component, input } from '@angular/core';

import { ProductDto } from '../../../core/products/products-api';
import { Button } from '../button/button';

@Component({
  selector: 'app-admin-product-row',
  imports: [Button],
  templateUrl: './admin-product-row.html',
  styleUrl: './admin-product-row.scss',
})
export class AdminProductRow {
  readonly product = input.required<ProductDto>();
  readonly categoryName = input.required<string>();
  readonly currencyName = input.required<string>();
}
