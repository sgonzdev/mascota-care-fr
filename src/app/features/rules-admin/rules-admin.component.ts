import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Regla } from '../../core/models/consultation.model';
import { RuleService } from '../../core/services/rule.service';
import { ToastService } from '../../core/services/toast.service';
import { URGENCIA_LABEL, URGENCIA_VARIANT } from '../../core/utils/consultation.utils';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-rules-admin',
  standalone: true,
  imports: [
    ReactiveFormsModule, BadgeComponent, ButtonComponent, CardComponent,
    FormFieldComponent, PageHeaderComponent,
  ],
  templateUrl: './rules-admin.component.html',
  styleUrl: './rules-admin.component.scss',
})
export class RulesAdminComponent {
  private readonly rules = inject(RuleService);
  private readonly toast = inject(ToastService);

  readonly reglas = this.rules.reglas;
  readonly editingId = signal<string | null>(null);
  readonly showForm = signal(false);
  readonly urgenciaLabel = URGENCIA_LABEL;
  readonly urgenciaVariant = URGENCIA_VARIANT;

  readonly form = inject(FormBuilder).nonNullable.group({
    condicionSintoma: ['', Validators.required],
    especieAplica: ['todas' as 'todas' | 'perro' | 'gato' | 'otro', Validators.required],
    edadMinMeses: [0, [Validators.required, Validators.min(0)]],
    edadMaxMeses: [240, [Validators.required, Validators.min(0)]],
    nivelUrgenciaResultado: ['MEDIA' as 'ALTA' | 'MEDIA' | 'BAJA', Validators.required],
    accionRecomendada: ['', [Validators.required, Validators.minLength(10)]],
    prioridad: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
    activa: [true],
  });

  new(): void {
    this.editingId.set(null);
    this.form.reset({
      condicionSintoma: '', especieAplica: 'todas', edadMinMeses: 0, edadMaxMeses: 240,
      nivelUrgenciaResultado: 'MEDIA', accionRecomendada: '', prioridad: 5, activa: true,
    });
    this.showForm.set(true);
  }

  edit(r: Regla): void {
    this.editingId.set(r.id);
    this.form.patchValue(r);
    this.showForm.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const data = this.form.getRawValue();
    const id = this.editingId();
    if (id) {
      this.rules.update(id, data);
      this.toast.success('Regla actualizada');
    } else {
      this.rules.create(data);
      this.toast.success('Regla creada');
    }
    this.showForm.set(false);
  }

  toggle(r: Regla): void {
    this.rules.toggle(r.id);
    this.toast.info(`Regla ${r.activa ? 'desactivada' : 'activada'}`);
  }
}
