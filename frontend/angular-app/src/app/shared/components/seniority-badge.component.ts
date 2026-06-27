import { Component, input } from '@angular/core';
import { Seniority } from '../../core/models/models';

const MAP: Record<Seniority, { label: string; cls: string }> = {
  [Seniority.Junior]: { label: 'Júnior', cls: 'bg-sky-100    text-sky-800'    },
  [Seniority.Pleno]:  { label: 'Pleno',  cls: 'bg-indigo-100 text-indigo-800' },
  [Seniority.Senior]: { label: 'Sênior', cls: 'bg-purple-100 text-purple-800' },
};

@Component({
  selector: 'app-seniority-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
          [class]="badge().cls">
      {{ badge().label }}
    </span>
  `,
  host: { class: 'inline-block' },
})
export class SeniorityBadgeComponent {
  value = input.required<Seniority>();
  badge() { return MAP[this.value()] ?? { label: String(this.value()), cls: 'bg-slate-100 text-slate-600' }; }
}
