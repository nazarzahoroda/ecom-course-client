import { Component, input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly name = input.required<string>();
  readonly amount = input.required<number>();
  readonly currency = input.required<string>();
  readonly imageUrl = input.required<string>();
}
