import { Component, EventEmitter, Input, Output, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (open()) {
      <!-- Backdrop -->
      <div class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
           (click)="cancel.emit()" aria-hidden="true"></div>

      <!-- Dialog -->
      <div role="dialog" aria-modal="true" [attr.aria-labelledby]="'modal-title-' + _uid"
           class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 space-y-5">

          <div class="flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <span class="text-red-600 text-lg">⚠</span>
            </div>
            <div>
              <h2 [id]="'modal-title-' + _uid"
                  class="text-base font-semibold text-slate-900">{{ title() }}</h2>
              <p class="mt-1 text-sm text-slate-500">{{ message() }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-1">
            <button (click)="cancel.emit()"
                    class="rounded-lg border border-slate-200 px-4 py-2 text-sm
                           font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button (click)="confirm.emit()"
                    class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium
                           text-white hover:bg-red-700 transition-colors">
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  readonly _uid = Math.random().toString(36).slice(2, 8);

  open         = input(false);
  title        = input('Confirmar exclusão');
  message      = input('Esta ação não pode ser desfeita. Deseja continuar?');
  confirmLabel = input('Excluir');

  confirm = output<void>();
  cancel  = output<void>();
}
