import { Component, input } from '@angular/core';
import { LanguageType } from '../../core/models/models';

const BADGE_MAP: Record<LanguageType, { label: string; cls: string }> = {
  [LanguageType.FrontEnd]:  { label: 'Front-End', cls: 'bg-violet-100 text-violet-800' },
  [LanguageType.BackEnd]:   { label: 'Back-End',  cls: 'bg-blue-100   text-blue-800'   },
  [LanguageType.Mobile]:    { label: 'Mobile',    cls: 'bg-green-100  text-green-800'  },
  [LanguageType.Database]:  { label: 'Database',  cls: 'bg-amber-100  text-amber-800'  },
  [LanguageType.DevOps]:    { label: 'DevOps',    cls: 'bg-slate-100  text-slate-700'  },
};

@Component({
  selector: 'app-language-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          [class]="badge().cls">
      {{ badge().label }}
    </span>
  `,
  host: { class: 'inline-block' },
})
export class LanguageBadgeComponent {
  type = input.required<LanguageType>();

  badge() {
    return BADGE_MAP[this.type()] ?? { label: String(this.type()), cls: 'bg-slate-100 text-slate-600' };
  }
}
