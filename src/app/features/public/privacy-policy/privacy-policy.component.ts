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
        <p>Esta política explica qué información se utiliza cuando accedes a Thermal Monitoring y cómo se relaciona con el monitoreo de eventos.</p>

        <h2>Qué información utilizamos</h2>
        <ul>
          <li>Datos de tu cuenta, como nombre de usuario, correo electrónico y rol asignado.</li>
          <li>Información de los eventos, incluidas imágenes, fechas, descripciones y estado de revisión.</li>
          <li>Mediciones ambientales asociadas a los eventos, como temperatura, humedad y calidad del aire.</li>
        </ul>

        <h2>Para qué se utiliza</h2>
        <p>Esta información permite acceder a tu cuenta, consultar y revisar eventos, y generar reportes y estadísticas para dar seguimiento al monitoreo.</p>

        <h2>Tu sesión y el cuidado de tu cuenta</h2>
        <p>Guardamos información de tu sesión en el navegador para mantener tu acceso. Al terminar, cierra sesión, especialmente si utilizas un equipo compartido, y evita compartir tu contraseña.</p>

        <h2>Uso responsable de imágenes y reportes</h2>
        <p>Las imágenes y los reportes pueden contener información sensible. Compártelos únicamente con las personas que deban consultarlos para realizar sus actividades de monitoreo y evita incluir datos personales innecesarios en las descripciones de los eventos.</p>

        <h2>Dudas sobre tu información</h2>
        <p>Si tienes dudas sobre el uso de tus datos o necesitas solicitar una corrección o eliminación, dirígete a la persona o al equipo que te proporcionó acceso a la plataforma.</p>
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

      h2 {
        margin-top: 1.5rem;
        font-size: 1.15rem;
      }

      p, li {
        color: var(--text);
        line-height: 1.6;
      }

      ul {
        padding-left: 1.2rem;
      }
    `,
  ],
})
export class PrivacyPolicyComponent {}
