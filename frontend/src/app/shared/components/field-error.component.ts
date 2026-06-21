import { Component, input } from '@angular/core';

@Component({
  selector: 'app-field-error',
  standalone: true,
  template: `
    @if (message()) {
      <p class="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
        <span aria-hidden="true">✕</span>{{ message() }}
      </p>
    }
  `,
})
export class FieldErrorComponent {
  message = input<string | null>(null);
}
