import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { EstadoConsulta } from '../../core/models/consultation.model';
import { ConsultationService } from '../../core/services/consultation.service';
import {
  ESTADO_LABEL,
  ESTADO_VARIANT,
  URGENCIA_LABEL,
  URGENCIA_VARIANT,
  formatPetAge,
  initialsOf,
} from '../../core/utils/consultation.utils';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

type StatusFilter = EstadoConsulta | 'all';

@Component({
  selector: 'app-consultation-list',
  standalone: true,
  imports: [RouterLink, IonIcon, BadgeComponent, DatePipe],
  templateUrl: './consultation-list.component.html',
  styleUrl: './consultation-list.component.scss',
})
export class ConsultationListComponent {
  private readonly service = inject(ConsultationService);

  readonly consultas = this.service.consultas;
  readonly activeCount = this.service.activeCount;
  readonly activeFilter = this.service.filter;

  readonly filters: { label: string; value: StatusFilter }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Activas', value: 'activa' },
    { label: 'Resueltas', value: 'resuelta' },
    { label: 'Archivadas', value: 'archivada' },
  ];

  readonly urgenciaLabel = URGENCIA_LABEL;
  readonly urgenciaVariant = URGENCIA_VARIANT;
  readonly estadoLabel = ESTADO_LABEL;
  readonly estadoVariant = ESTADO_VARIANT;
  readonly formatPetAge = formatPetAge;
  readonly initialsOf = initialsOf;

  setFilter(value: StatusFilter): void {
    this.service.setFilter(value);
  }
}
