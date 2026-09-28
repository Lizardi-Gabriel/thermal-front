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
        background: var(--bg);
        color: var(--text);
        padding: 2rem;
      }

      .policy-card {
        max-width: 800px;
        background: var(--bg-elevated);
        border: 1px solid var(--panel-border);
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 18px 40px var(--shadow);
      }

      h1 {
        margin-top: 0;
        color: var(--text);
      }

      p, li {
        color: var(--text);
      }

      ul {
        padding-left: 1.2rem;
      }
    `,
  ],
})
export class PrivacyPolicyComponent {}
