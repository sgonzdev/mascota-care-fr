import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IonIcon, ButtonComponent, FormFieldComponent],
  templateUrl: './register.component.html',
  styleUrl: './login.component.scss',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    try {
      await this.auth.register(this.form.getRawValue());
      this.toast.success('Cuenta creada. ¡Bienvenido!');
      this.router.navigate(['/dashboard']);
    } catch {
      this.toast.error('No se pudo crear la cuenta. Verifica los datos.');
    } finally {
      this.loading.set(false);
    }
  }

  err(ctrl: string): string | null {
    const c = this.form.get(ctrl);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Campo obligatorio';
    if (c.errors['email']) return 'Email inválido';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    return 'Valor inválido';
  }
}
