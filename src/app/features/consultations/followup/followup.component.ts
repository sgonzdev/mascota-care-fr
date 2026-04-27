import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConsultationService } from '../../../core/services/consultation.service';
import { EstadoSeguimiento } from '../../../core/models/consultation.model';
import { ToastService } from '../../../core/services/toast.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-followup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent, FormFieldComponent, PageHeaderComponent],
  templateUrl: './followup.component.html',
  styleUrl: './followup.component.scss',
})
export class FollowupComponent {
  private readonly service = inject(ConsultationService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly id = signal<string>('');
  readonly consulta = this.service.selected;
  readonly estado = signal<EstadoSeguimiento>('mejoro');

  readonly form = inject(FormBuilder).nonNullable.group({
    observaciones: [''],
  });

  constructor() {
    effect(() => { if (this.id()) this.service.select(this.id()); });
  }

  setEstado(e: EstadoSeguimiento): void { this.estado.set(e); }

  submit(): void {
    const c = this.consulta();
    if (!c) return;
    this.service.addFollowup(c.id, {
      fechaSeguimiento: new Date(),
      estado: this.estado(),
      observaciones: this.form.controls.observaciones.value,
    });
    const msg = this.estado() === 'mejoro'
      ? 'Seguimiento guardado — ¡qué bueno que mejoró!'
      : this.estado() === 'no_mejoro'
        ? 'Seguimiento guardado. Se enviará alerta al veterinario.'
        : 'Seguimiento guardado sin cambios';
    this.toast.success(msg);
    this.router.navigate(['/consultations', c.id]);
  }
}
