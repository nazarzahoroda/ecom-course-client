import { Component } from '@angular/core';

import { StorefrontCategoryCard } from '../../../shared/components/storefront-category-card/storefront-category-card';
import { ProductCard } from '../../../shared/components/product-card/product-card';
@Component({
  selector: 'app-home-page',
  imports: [StorefrontCategoryCard, ProductCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {}
