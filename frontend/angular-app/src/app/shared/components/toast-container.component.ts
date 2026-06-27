import { Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="fixed top-5 right-5 z-50 flex flex-col gap-3 w-80" aria-live="polite">
      @for (t of svc.toasts(); track t.id) {
        <div role="alert"
             class="flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg text-sm
                    font-medium animate-slide-in"
             [class]="cls(t.type)">
          <span class="text-base shrink-0 mt-0.5">{{ icon(t.type) }}</span>
          <p class="flex-1 leading-snug">{{ t.message }}</p>
          <button (click)="svc.dismiss(t.id)"
                  class="ml-auto opacity-50 hover:opacity-100 transition-opacity text-lg leading-none"
                  aria-label="Fechar">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { opacity:0; transform:translateX(1.5rem); }
      to   { opacity:1; transform:translateX(0); }
    }
    .animate-slide-in { animation: slide-in .2s ease-out both; }
  `],
})
export class ToastContainerComponent {
  readonly svc = inject(ToastService);

  cls(type: string): string {
    return ({
      success: 'bg-emerald-50 text-emerald-900 border border-emerald-200',
      error:   'bg-red-50   text-red-900   border border-red-200',
      warning: 'bg-amber-50 text-amber-900 border border-amber-200',
      info:    'bg-sky-50   text-sky-900   border border-sky-200',
    } as Record<string,string>)[type] ?? '';
  }

  icon(type: string): string {
    return ({ success:'✓', error:'✕', warning:'⚠', info:'ℹ' } as Record<string,string>)[type] ?? 'ℹ';
  }
}
