import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<'primary' | 'secondary' | 'danger'>('secondary');
  readonly fullWidth = input(false);
  readonly disabled = input(false);

  readonly classes = computed(() => {
    const width = this.fullWidth() ? ' w-full' : '';

    if (this.disabled()) {
      return 'cursor-not-allowed rounded-lg border-0 bg-gray-300 px-4 py-2.5 text-gray-500' + width;
    }

    switch (this.variant()) {
      case 'primary':
        return 'cursor-pointer rounded-lg border-0 bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700' + width;
      case 'danger':
        return 'cursor-pointer rounded-md border border-red-200 bg-white px-3 py-2 text-red-700 hover:bg-red-50' + width;
      default:
        return 'cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 hover:bg-gray-50' + width;
    }
  });
}
