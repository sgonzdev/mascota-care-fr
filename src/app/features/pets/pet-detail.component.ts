import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Especie, Sexo } from '../../core/models/consultation.model';
import { PetService } from '../../core/services/pet.service';
import { ToastService } from '../../core/services/toast.service';
import {
  SEXO_LABEL,
  formatPetAge,
  initialsOf,
} from '../../core/utils/consultation.utils';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-pet-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    ButtonComponent, CardComponent, FormFieldComponent, PageHeaderComponent,
  ],
  templateUrl: './pet-detail.component.html',
  styleUrl: './pet-register.component.scss',
})
export class PetDetailComponent {
  private readonly service = inject(PetService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();
  readonly editing = signal(false);
  readonly saving = signal(false);

  readonly mascota = computed(() =>
    this.service.mascotas().find(m => m.id === this.id()) ?? null,
  );

  readonly sexoLabel = SEXO_LABEL;
  readonly formatPetAge = formatPetAge;
  readonly initialsOf = initialsOf;

  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    especie: ['perro' as Especie, Validators.required],
    raza: ['', Validators.required],
    edadMeses: [12, [Validators.required, Validators.min(0), Validators.max(360)]],
    pesoKg: [5, [Validators.required, Validators.min(0.1), Validators.max(200)]],
    sexo: ['macho' as Sexo, Validators.required],
  });

  constructor() {
    effect(() => {
      const m = this.mascota();
      if (m) {
        this.form.patchValue({
          nombre: m.nombre, especie: m.especie, raza: m.raza,
          edadMeses: m.edadMeses, pesoKg: m.pesoKg, sexo: m.sexo,
        });
      }
    });
  }

  startEdit(): void { this.editing.set(true); }
  cancelEdit(): void { this.editing.set(false); }

  async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const m = this.mascota();
    if (!m) return;
    this.saving.set(true);
    try {
      await this.service.update(m.id, this.form.getRawValue());
      this.toast.success('Mascota actualizada');
      this.editing.set(false);
    } catch {
      this.toast.error('No se pudo actualizar la mascota');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(): Promise<void> {
    const m = this.mascota();
    if (!m) return;
    if (!confirm(`¿Eliminar a ${m.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await this.service.remove(m.id);
      this.toast.success(`${m.nombre} fue eliminada`);
      this.router.navigate(['/dashboard']);
    } catch {
      this.toast.error('No se pudo eliminar la mascota');
    }
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
