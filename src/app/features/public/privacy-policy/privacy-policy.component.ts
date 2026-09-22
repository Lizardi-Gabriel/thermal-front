import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="policy-shell">
      <article class="policy-card">
        <h1>Política de privacidad</h1>
        <p>Se elimina la dependencia de Firebase y dispositivos móviles para esta versión web.</p>
        <ul>
          <li>Se recopilan datos de cuenta, eventos y calidad del aire.</li>
          <li>La autenticación se realiza mediante JWT en la API.</li>
          <li>La información se usa para gestión de eventos, reportes y estadísticas web.</li>
        </ul>
      </article>
    </main>
  `,
  styles: [
    `
      .policy-shell {
        display: grid;
        place-items: center;
        min-height: 100vh;
        background: #0b1220;
        color: #e5edf8;
        padding: 2rem;
      }

      .policy-card {
        max-width: 800px;
        background: #111b2d;
        border: 1px solid #24314a;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.5);
      }

      h1 {
        margin-top: 0;
        color: #f8fbff;
      }

      p, li {
        color: #dfeafc;
      }

      ul {
        padding-left: 1.2rem;
      }
    `,
  ],
})
export class PrivacyPolicyComponent {}
