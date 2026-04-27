import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { ConsultationService } from '../../../core/services/consultation.service';
import {
  ESTADO_LABEL,
  ESTADO_VARIANT,
  SEXO_LABEL,
  URGENCIA_LABEL,
  URGENCIA_VARIANT,
  formatPetAge,
  initialsOf,
} from '../../../core/utils/consultation.utils';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-consultation-detail',
  standalone: true,
  imports: [RouterLink, IonIcon, BadgeComponent, DatePipe],
  templateUrl: './consultation-detail.component.html',
  styleUrl: './consultation-detail.component.scss',
})
export class ConsultationDetailComponent {
  private readonly router = inject(Router);
  private readonly service = inject(ConsultationService);

  readonly id = input.required<string>();
  readonly noteText = signal('');
  readonly consulta = this.service.selected;

  readonly urgenciaLabel = URGENCIA_LABEL;
  readonly urgenciaVariant = URGENCIA_VARIANT;
  readonly estadoLabel = ESTADO_LABEL;
  readonly estadoVariant = ESTADO_VARIANT;
  readonly sexoLabel = SEXO_LABEL;
  readonly formatPetAge = formatPetAge;
  readonly initialsOf = initialsOf;

  constructor() {
    effect(() => this.service.select(this.id()));

    effect(() => {
      const c = this.consulta();
      if (c === null) {
        this.router.navigate(['/consultations']);
        return;
      }
      this.noteText.set(c.notasInternas);
    });
  }

  archive(): void {
    const c = this.consulta();
    if (!c) return;
    this.service.archive(c.id);
    this.router.navigate(['/consultations']);
  }

  saveNote(): void {
    const c = this.consulta();
    if (c) this.service.updateNotes(c.id, this.noteText());
  }

  onNoteChange(event: Event): void {
    this.noteText.set((event.target as HTMLTextAreaElement).value);
  }
}
