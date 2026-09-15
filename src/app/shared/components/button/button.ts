import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<'primary' | 'secondary' | 'danger'>('secondary');
  readonly fullWidth = input(false);
}
