import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-shell">
      <div class="auth-card">
        <h1>Recuperar contraseña</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Correo electrónico
            <input formControlName="correo_electronico" type="email" />
          </label>

          <button type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Enviando...' : 'Enviar enlace' }}</button>
          <a routerLink="/login">Volver al login</a>
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

      a {
        color: #93c5fd;
        text-decoration: none;
      }
    `,
  ],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);

  loading = false;
  form = this.fb.nonNullable.group({
    correo_electronico: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.http.post(`${environment.apiUrl}/auth/forgot-password`, this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        alert('Si el correo existe, se enviará el enlace de recuperación.');
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
