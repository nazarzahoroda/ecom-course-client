import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../../../shared/components/header/header';
import { Footer } from '../../../shared/components/footer/footer';

@Component({
  selector: 'app-storefront-layout',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './storefront-layout.html',
  styleUrl: './storefront-layout.scss',
})
export class StorefrontLayout {}
