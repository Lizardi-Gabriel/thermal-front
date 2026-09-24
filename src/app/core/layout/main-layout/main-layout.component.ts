import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout-shell">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark">T</span>
          <div>
            <strong>Thermal</strong>
            <small>Front</small>
          </div>
        </div>

        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/eventos" routerLinkActive="active">Eventos</a>
          <a routerLink="/reports" routerLinkActive="active">Reportes</a>
          <a routerLink="/settings" routerLinkActive="active">Configuración</a>
        </nav>
      </aside>

      <div class="content-shell">
        <header class="topbar">
          <div>
            <span class="eyebrow">Panel</span>
            <h2>Monitoreo</h2>
          </div>

          <div class="user-box">
            <span>{{ userName }}</span>
            <button type="button" (click)="logout()">Cerrar sesión</button>
          </div>
        </header>

        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .layout-shell {
        display: grid;
        grid-template-columns: 240px minmax(0, 1fr);
        min-height: 100vh;
        background: #0b1220;
        color: #e5edf8;
      }

      .sidebar {
        background: linear-gradient(180deg, #0f172a 0%, #111b2d 100%);
        border-right: 1px solid #24314a;
        padding: 1.5rem 1rem;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem 1.5rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        margin-bottom: 1rem;
      }

      .brand-mark {
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #60a5fa, #3b82f6);
        font-weight: 700;
      }

      .brand strong,
      .brand small {
        display: block;
      }

      .brand small {
        color: #93c5fd;
      }

      .nav {
        display: grid;
        gap: 0.5rem;
      }

      .nav a {
        color: #dfeafc;
        text-decoration: none;
        padding: 0.8rem 0.9rem;
        border-radius: 10px;
        transition: 0.2s ease;
      }

      .nav a.active,
      .nav a:hover {
        background: rgba(96, 165, 250, 0.14);
        color: #ffffff;
      }

      .content-shell {
        min-width: 0;
        display: flex;
        flex-direction: column;
      }

      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 2rem;
        border-bottom: 1px solid #24314a;
        background: rgba(15, 23, 42, 0.8);
      }

      .eyebrow {
        color: #93c5fd;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
        text-transform: uppercase;
      }

      h2 {
        margin: 0.2rem 0 0;
        font-size: 1.5rem;
      }

      .user-box {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .user-box span {
        color: #dfeafc;
      }

      .user-box button {
        border: 1px solid #24314a;
        background: transparent;
        color: #dfeafc;
        border-radius: 10px;
        padding: 0.7rem 0.9rem;
        cursor: pointer;
      }

      .page-content {
        min-width: 0;
        flex: 1;
        padding: 1.5rem 2rem 2rem;
      }

      @media (max-width: 600px) {
        .page-content { padding: 1rem; }
        .topbar { padding: 1rem; flex-wrap: wrap; gap: 1rem; }
        .user-box { flex-wrap: wrap; }
      }

      @media (max-width: 900px) {
        .layout-shell {
          grid-template-columns: minmax(0, 1fr);
        }

        .sidebar {
          border-right: none;
          border-bottom: 1px solid #24314a;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  userName = 'Usuario';

  constructor() {
    const currentUser = JSON.parse(localStorage.getItem('current_user') ?? 'null');
    this.userName = currentUser?.nombre_usuario ?? 'Usuario';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
