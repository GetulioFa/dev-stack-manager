import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Desenvolvedores', route: '/developers', icon: '👨‍💻' },
  { label: 'Linguagens',      route: '/languages',  icon: '🧩' },
  { label: 'Localizações',    route: '/locations',  icon: '📍' },
];

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="flex h-screen bg-slate-50 overflow-hidden">

      <!-- ── Sidebar ─────────────────────────────────────────────────────── -->
      <aside class="w-60 bg-slate-900 flex flex-col shrink-0">

        <!-- Logo -->
        <div class="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800">
          <span class="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center
                       text-white text-sm font-bold shrink-0">DS</span>
          <span class="text-white text-sm font-semibold tracking-tight leading-tight">
            DevStack<br><span class="text-indigo-400">Manager</span>
          </span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-3 py-4 space-y-0.5" aria-label="Navegação principal">
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route"
               routerLinkActive="bg-slate-800 text-white"
               [routerLinkActiveOptions]="{ exact: false }"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                      text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <span class="text-base" aria-hidden="true">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
        </nav>

        <!-- User footer -->
        <div class="border-t border-slate-800 p-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center
                        text-white text-xs font-bold shrink-0">
              {{ userInitial() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-white truncate">{{ userName() }}</p>
              <p class="text-xs text-slate-500 truncate">{{ userEmail() }}</p>
            </div>
            <a routerLink="/profile"
               class="text-slate-500 hover:text-indigo-400 transition-colors"
               title="Meu perfil" aria-label="Editar meu perfil">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </a>
            <button (click)="logout()"
                    class="text-slate-500 hover:text-red-400 transition-colors"
                    title="Sair" aria-label="Sair da conta">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- ── Main area ───────────────────────────────────────────────────── -->
      <div class="flex-1 flex flex-col min-w-0 overflow-auto">
        <router-outlet />
      </div>
    </div>
  `,
})
export class ShellLayoutComponent {
  private readonly auth   = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems = NAV_ITEMS;

  readonly userName    = computed(() => this.auth.currentUser()?.name  ?? '');
  readonly userEmail   = computed(() => this.auth.currentUser()?.email ?? '');
  readonly userInitial = computed(() => (this.auth.currentUser()?.name?.[0] ?? '?').toUpperCase());

  logout(): void { this.auth.logout(); }
}
