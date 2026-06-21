import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex">
      <!-- Brand panel -->
      <aside class="hidden lg:flex lg:w-2/5 flex-col justify-between
                    bg-slate-900 px-12 py-14 text-white relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.04]"
             style="background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);background-size:32px 32px"
             aria-hidden="true"></div>
        <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600
                    opacity-20 blur-3xl pointer-events-none" aria-hidden="true"></div>

        <div class="relative z-10 flex items-center gap-3">
          <span class="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center
                       text-white font-bold text-sm">DS</span>
          <span class="text-base font-semibold tracking-tight">DevStackManager</span>
        </div>

        <div class="relative z-10 space-y-4">
          <h1 class="text-4xl font-bold leading-tight">
            Gerencie seu time de<br>
            <span class="text-indigo-400">desenvolvedores</span><br>
            com precisão.
          </h1>
          <p class="text-slate-400 text-sm max-w-xs leading-relaxed">
            Centralize senioridades, linguagens e localizações numa plataforma
            feita para equipes de engenharia.
          </p>
        </div>

        <p class="relative z-10 text-slate-600 text-xs">&copy; {{ year }} DevStackManager</p>
      </aside>

      <!-- Form panel -->
      <main class="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12 sm:px-10">
        <div class="lg:hidden mb-8 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center
                       text-white font-bold text-sm">DS</span>
          <span class="font-semibold text-slate-800">DevStackManager</span>
        </div>
        <div class="w-full max-w-md">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class AuthLayoutComponent {
  readonly year = new Date().getFullYear();
}
