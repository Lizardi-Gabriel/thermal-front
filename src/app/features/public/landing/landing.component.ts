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
        background: radial-gradient(circle at top, rgba(96, 165, 250, 0.18), transparent 35%), #0b1220;
        color: #e5edf8;
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
        color: #93c5fd;
      }

      h1 {
        font-size: clamp(2.5rem, 5vw, 4rem);
        margin: 0.5rem 0 1rem;
        color: #f8fbff;
      }

      .subtitle {
        font-size: 1.15rem;
        color: #c9d7ee;
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
        background: linear-gradient(135deg, #60a5fa, #3b82f6);
        color: white;
        font-weight: 700;
      }

      .secondary {
        background: #111b2d;
        color: #e5edf8;
        border: 1px solid #24314a;
      }
    `,
  ],
})
export class LandingComponent {}
