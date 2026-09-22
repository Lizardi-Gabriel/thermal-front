import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-shell">
      <h1>Configuración</h1>
      <p>Se mantienen solo configuraciones útiles para una versión web: perfil, usuarios y preferencias del sistema.</p>
    </section>
  `,
  styles: [
    `
      .page-shell { padding: 2rem; }
    `,
  ],
})
export class SettingsComponent {}
