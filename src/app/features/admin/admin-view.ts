import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-view',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-view.html',
  styleUrl: './admin-view.scss',
})
export class AdminView { }
