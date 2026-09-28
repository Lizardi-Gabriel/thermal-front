import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="hero">
      <div class="hero-inner">
        <p class="eyebrow">Thermal Monitoring</p>
        <h1>Monitoreo inteligente de eventos térmicos</h1>
        <p class="subtitle">Plataforma web para gestión de eventos, imagenes y reportes sin depender de Firebase ni vistas renderizadas desde el backend.</p>
        <div class="actions">
          <a routerLink="/login">Acceder</a>
          <a routerLink="/privacy-policy" class="secondary">Política de privacidad</a>
        </div>
      </div>
    </main>
  `,
  styles: [
    `
      .hero {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top, var(--glow), transparent 35%), var(--bg);
        color: var(--text);
      }

      .hero-inner {
        max-width: 800px;
        text-align: center;
        padding: 2rem;
      }

      .eyebrow {
        letter-spacing: .12em;
        text-transform: uppercase;
        font-weight: 700;
        color: var(--primary);
      }

      h1 {
        font-size: clamp(2.5rem, 5vw, 4rem);
        margin: 0.5rem 0 1rem;
        color: var(--text);
      }

      .subtitle {
        font-size: 1.15rem;
        color: var(--muted);
      }

      .actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
        flex-wrap: wrap;
      }

      a {
        padding: 0.9rem 1.25rem;
        text-decoration: none;
        border-radius: 10px;
        background: var(--primary);
        color: var(--on-primary);
        font-weight: 700;
      }

      .secondary {
        background: var(--bg-elevated);
        color: var(--text);
        border: 1px solid var(--panel-border);
      }
    `,
  ],
})
export class LandingComponent {}
