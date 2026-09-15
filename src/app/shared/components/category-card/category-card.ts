import { Component, input, output } from '@angular/core';

import { CategoryDto } from '../../../core/categories/categories-api';
import { Button } from '../button/button';

@Component({
  selector: 'app-category-card',
  imports: [Button],
  templateUrl: './category-card.html',
  styleUrl: './category-card.scss',
})
export class CategoryCard {
  readonly category = input.required<CategoryDto>();
  readonly edit = output<CategoryDto>();
  readonly delete = output<CategoryDto>();
}
