// ============================================================
// Fichier : src/app/features/auth/login/login.component.ts
// ============================================================
import { Component, signal }            from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule }                 from '@angular/router';
import { AuthService }                  from '../../../core/services/auth.service';

@Component({
  selector:    'app-login',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  form: FormGroup;
  loading  = signal(false);
  error    = signal('');
  showPass = signal(false);

  constructor(
    private fb:   FormBuilder,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.auth.redirectAfterLogin();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || 'Identifiants incorrects. Veuillez réessayer.'
        );
      },
    });
  }
}