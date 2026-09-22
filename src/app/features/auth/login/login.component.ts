import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="auth-card">
        <h1>Iniciar sesión</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Usuario
            <input formControlName="username" type="text" />
          </label>

          <label>
            Contraseña
            <input formControlName="password" type="password" />
          </label>

          <button type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Ingresando...' : 'Entrar' }}</button>

          <div class="links">
            <a routerLink="/forgot-password">¿Olvidaste tu contraseña?</a>
          </div>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      .auth-shell {
        display: grid;
        place-items: center;
        min-height: 100vh;
        background: #0b1220;
      }

      .auth-card {
        width: min(420px, 90vw);
        background: #111b2d;
        border: 1px solid #24314a;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.5);
      }

      h1 {
        margin-bottom: 1.5rem;
        font-size: 2rem;
        color: #e5edf8;
      }

      form {
        display: grid;
        gap: 1rem;
      }

      label {
        display: grid;
        gap: 0.4rem;
        font-weight: 600;
        color: #dfeafc;
      }

      input {
        border: 1px solid #24314a;
        border-radius: 10px;
        padding: 0.8rem 0.9rem;
        font-size: 1rem;
        background: #0f172a;
        color: #e5edf8;
      }

      input::placeholder {
        color: #9aa9c2;
      }

      button {
        border: none;
        border-radius: 10px;
        background: linear-gradient(135deg, #60a5fa, #3b82f6);
        color: white;
        padding: 0.9rem 1rem;
        font-weight: 700;
        cursor: pointer;
      }

      button:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .links {
        text-align: right;
      }

      a {
        color: #93c5fd;
        text-decoration: none;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly logger = inject(NGXLogger);

  loading = false;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.logger.warn('Intento de login con formulario inválido');
      return;
    }

    this.loading = true;
    this.logger.info('Intentando iniciar sesión', this.form.getRawValue());

    this.authService
      .login(this.form.getRawValue())
      .subscribe({
        next: () => {
          this.logger.info('Login exitoso');
          this.router.navigateByUrl('/dashboard');
        },
        error: (error) => {
          this.logger.error('Error en login', error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
