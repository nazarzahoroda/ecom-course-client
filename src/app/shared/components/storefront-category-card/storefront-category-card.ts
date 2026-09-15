import { Component, input } from '@angular/core';

@Component({
  selector: 'app-storefront-category-card',
  imports: [],
  templateUrl: './storefront-category-card.html',
  styleUrl: './storefront-category-card.scss',
})
export class StorefrontCategoryCard {
  readonly name = input.required<string>();
  readonly imageUrl = input.required<string>();
}
