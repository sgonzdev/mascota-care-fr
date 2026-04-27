import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IonIcon, ButtonComponent, FormFieldComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.login(email, password);
      this.toast.success('Sesión iniciada');
      this.router.navigate(['/dashboard']);
    } finally {
      this.loading.set(false);
    }
  }

  async quickLogin(role: 'dueno' | 'admin'): Promise<void> {
    this.loading.set(true);
    try {
      await this.auth.loginAs(role);
      this.toast.success(`Entraste como ${role === 'admin' ? 'Administrador' : 'Dueño'}`);
      this.router.navigate(['/dashboard']);
    } finally {
      this.loading.set(false);
    }
  }

  err(ctrl: string): string | null {
    const c = this.form.get(ctrl);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Campo obligatorio';
    if (c.errors['email']) return 'Email inválido';
    if (c.errors['minlength']) return 'Mínimo 4 caracteres';
    return 'Valor inválido';
  }
}
