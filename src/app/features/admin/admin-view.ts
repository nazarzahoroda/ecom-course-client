import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth-service';
import { CartStateService } from '../../core/carts/cart-state.service';

@Component({
  selector: 'app-admin-view',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-view.html',
  styleUrl: './admin-view.scss',
})
export class AdminView {
  private readonly authService = inject(AuthService);
  private readonly cartState = inject(CartStateService);
  private readonly router = inject(Router);

  protected backToStore(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.cartState.clear();
        this.router.navigate(['/']);
      },
    });
  }
}
