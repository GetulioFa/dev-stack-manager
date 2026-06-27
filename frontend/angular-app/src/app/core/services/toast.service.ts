import { Injectable, computed, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _counter = 0;
  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts = computed(() => this._toasts());

  show(message: string, type: ToastType = 'info', ms = 4500): void {
    const id = ++this._counter;
    this._toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), ms);
  }

  success(msg: string): void { this.show(msg, 'success'); }
  error(msg: string):   void { this.show(msg, 'error', 6000); }
  warning(msg: string): void { this.show(msg, 'warning'); }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
