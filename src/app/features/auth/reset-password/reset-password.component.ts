import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="auth-shell">
      <div class="auth-card">
        <h1>Restablecer contraseña</h1>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Nueva contraseña
            <input formControlName="nueva_password" type="password" />
          </label>
          <button type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Guardando...' : 'Guardar' }}</button>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      .auth-shell { display: grid; place-items: center; min-height: 100vh; background: #f5f7fb; }
      .auth-card { width: min(420px, 90vw); background: white; border-radius: 16px; padding: 2rem; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); }
      h1 { margin-bottom: 1.5rem; font-size: 2rem; }
      form { display: grid; gap: 1rem; }
      label { display: grid; gap: 0.4rem; font-weight: 600; }
      input { border: 1px solid #dbe2ea; border-radius: 10px; padding: 0.8rem 0.9rem; font-size: 1rem; }
      button { border: none; border-radius: 10px; background: #0f172a; color: white; padding: 0.9rem 1rem; font-weight: 700; cursor: pointer; }
    `,
  ],
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  loading = false;
  token = this.route.snapshot.queryParamMap.get('token') ?? '';

  form = this.fb.nonNullable.group({
    nueva_password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid || !this.token) return;

    this.loading = true;
    this.http
      .post(`${environment.apiUrl}/auth/reset-password`, {
        token: this.token,
        nueva_password: this.form.value.nueva_password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigateByUrl('/login');
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
