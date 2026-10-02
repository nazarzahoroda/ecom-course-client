import { Component, computed, inject } from '@angular/core';
import { CartStateService } from '../../../core/carts/cart-state.service';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  protected readonly cartState = inject(CartStateService);

  protected readonly isAdmin = computed(() =>
    this.authService.currentUser()?.roles.includes('Admin') ?? false
  );

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.cartState.loadCart();
    }
  }

  protected onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.cartState.clear();
        this.router.navigate(['/login']);
      }
    });
  }
}
