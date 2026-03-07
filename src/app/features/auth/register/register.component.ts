// ============================================================
// Fichier : src/app/features/auth/register/register.component.ts
// ============================================================
import { Component, signal }            from '@angular/core';
import { CommonModule }                 from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RouterModule }                 from '@angular/router';
import { AuthService }                  from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl) {
  const pass    = control.get('password');
  const confirm = control.get('password_confirmation');
  if (!pass || !confirm) return null;

  if (pass.value && confirm.value && pass.value !== confirm.value) {
    confirm.setErrors({ mismatch: true });
  } else {
    // Nettoyer l'erreur mismatch si les mots de passe correspondent
    const errors = { ...confirm.errors };
    delete errors['mismatch'];
    confirm.setErrors(Object.keys(errors).length ? errors : null);
  }
  return null;
}

@Component({
  selector:    'app-register',
  standalone:  true,
  imports:     [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  form: FormGroup;
  loading  = signal(false);
  error    = signal('');
  success  = signal('');
  showPass    = signal(false);
  showConfirm = signal(false);
  step     = signal<1|2>(1); // Étape 1 : infos, Étape 2 : rôle

  constructor(
    private fb:   FormBuilder,
    private auth: AuthService,
  ) {
    this.form = this.fb.group({
      name:                  ['', [Validators.required, Validators.minLength(3)]],
      email:                 ['', [Validators.required, Validators.email]],
      phone:                 ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)]],
      role:                  ['acheteur', [Validators.required]],
      password:              ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      // Champs conditionnels selon le rôle
      type:            [''],  // acheteur : restaurant|cantine|hotel|traiteur|particulier
      nom_poulailler:  [''],  // eleveur   : requis
    }, { validators: passwordMatchValidator });

    // Validateurs initiaux pour le rôle par défaut (acheteur)
    this.form.get('type')!.setValidators([Validators.required]);
    this.form.get('type')!.updateValueAndValidity();
  }

  get name()    { return this.form.get('name')!; }
  get email()   { return this.form.get('email')!; }
  get phone()   { return this.form.get('phone')!; }
  get role()    { return this.form.get('role')!; }
  get password(){ return this.form.get('password')!; }
  get confirm()        { return this.form.get('password_confirmation')!; }
  get type()           { return this.form.get('type')!; }
  get nomPoulailler()  { return this.form.get('nom_poulailler')!; }

  setRole(r: 'eleveur'|'acheteur'): void {
    this.form.patchValue({ role: r, type: '', nom_poulailler: '' });
    // Appliquer les validateurs selon le rôle
    if (r === 'acheteur') {
      this.form.get('type')!.setValidators([Validators.required]);
      this.form.get('nom_poulailler')!.clearValidators();
    } else {
      this.form.get('nom_poulailler')!.setValidators([Validators.required, Validators.minLength(2)]);
      this.form.get('type')!.clearValidators();
    }
    this.form.get('type')!.updateValueAndValidity();
    this.form.get('nom_poulailler')!.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.auth.redirectAfterLogin();
      },
      error: (err) => {
        this.loading.set(false);
        const errors = err.error?.errors;
        if (errors) {
          const first = Object.values(errors)[0] as string[];
          this.error.set(first[0]);
        } else {
          this.error.set(err.error?.message || 'Erreur lors de l\'inscription.');
        }
      },
    });
  }
}