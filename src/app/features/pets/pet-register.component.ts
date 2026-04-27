import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PetService } from '../../core/services/pet.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-pet-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, FormFieldComponent, PageHeaderComponent],
  templateUrl: './pet-register.component.html',
  styleUrl: './pet-register.component.scss',
})
export class PetRegisterComponent {
  private readonly service = inject(PetService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    especie: ['perro' as 'perro' | 'gato' | 'otro', Validators.required],
    raza: ['', Validators.required],
    edadMeses: [12, [Validators.required, Validators.min(0), Validators.max(360)]],
    pesoKg: [5, [Validators.required, Validators.min(0.1), Validators.max(200)]],
    sexo: ['macho' as 'macho' | 'hembra', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const mascota = this.service.create(this.form.getRawValue());
    this.toast.success(`${mascota.nombre} fue registrada`);
    this.router.navigate(['/consultations/new'], { queryParams: { pet: mascota.id } });
  }

  err(ctrl: string): string | null {
    const c = this.form.get(ctrl);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Campo obligatorio';
    if (c.errors['min']) return `Mínimo ${c.errors['min'].min}`;
    if (c.errors['max']) return `Máximo ${c.errors['max'].max}`;
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    return 'Valor inválido';
  }
}
