import { Component, computed, inject } from '@angular/core';
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

  protected readonly isAdmin = computed(() =>
    this.authService.currentUser()?.roles.includes('Admin') ?? false
  );

  protected onLogout(): void {
    this.authService.logout().subscribe({
       next: () => {
        this.router.navigate(['/login']);
       }
    });
  }
}
