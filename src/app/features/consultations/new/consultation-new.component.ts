import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsultationService } from '../../../core/services/consultation.service';
import { PetService } from '../../../core/services/pet.service';
import { ToastService } from '../../../core/services/toast.service';
import { URGENCIA_LABEL, URGENCIA_VARIANT } from '../../../core/utils/consultation.utils';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-consultation-new',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, BadgeComponent, ButtonComponent, CardComponent,
    EmptyStateComponent, FormFieldComponent, PageHeaderComponent,
  ],
  templateUrl: './consultation-new.component.html',
  styleUrl: './consultation-new.component.scss',
})
export class ConsultationNewComponent {
  private readonly pets = inject(PetService);
  private readonly consultations = inject(ConsultationService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly myPets = this.pets.myPets;
  readonly urgenciaLabel = URGENCIA_LABEL;
  readonly urgenciaVariant = URGENCIA_VARIANT;

  readonly result = signal<{ id: string; nivel: 'ALTA'|'MEDIA'|'BAJA'; accion: string } | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group({
    idMascota: ['', Validators.required],
    descripcionSintomas: ['', [Validators.required, Validators.minLength(10)]],
  });

  readonly selectedPet = computed(() => {
    const id = this.form.controls.idMascota.value;
    return this.myPets().find(m => m.id === id) ?? null;
  });

  constructor() {
    const petId = this.route.snapshot.queryParamMap.get('pet');
    if (petId) this.form.patchValue({ idMascota: petId });
    else if (this.myPets()[0]) this.form.patchValue({ idMascota: this.myPets()[0]!.id });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const pet = this.selectedPet();
    if (!pet) return;
    const { descripcionSintomas } = this.form.getRawValue();
    const { consulta, triage } = this.consultations.create(pet, descripcionSintomas);
    this.result.set({ id: consulta.id, nivel: triage.nivel, accion: triage.accion });
    this.toast.success(`Triage completado: urgencia ${triage.nivel}`);
  }

  goToDetail(): void {
    const r = this.result();
    if (r) this.router.navigate(['/consultations', r.id]);
  }

  err(ctrl: string): string | null {
    const c = this.form.get(ctrl);
    if (!c || !c.touched || !c.errors) return null;
    if (c.errors['required']) return 'Campo obligatorio';
    if (c.errors['minlength']) return `Describe al menos ${c.errors['minlength'].requiredLength} caracteres`;
    return null;
  }
}
