import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { ConsultationService } from '../../core/services/consultation.service';
import {
  initialsOf,
  URGENCIA_LABEL,
  URGENCIA_VARIANT,
} from '../../core/utils/consultation.utils';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, IonIcon, BadgeComponent, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly service = inject(ConsultationService);

  readonly recientes = this.service.consultas;

  readonly stats = [
    { label: 'Consultas Activas', icon: 'pulse-outline', colorClass: 'stat--primary', value: this.service.activeCount },
    { label: 'Resueltas Hoy', icon: 'checkmark-done-outline', colorClass: 'stat--success', value: this.service.resolvedTodayCount },
    { label: 'Urgencias Altas', icon: 'alert-outline', colorClass: 'stat--danger', value: this.service.highUrgencyCount },
  ];

  readonly urgenciaLabel = URGENCIA_LABEL;
  readonly urgenciaVariant = URGENCIA_VARIANT;
  readonly initialsOf = initialsOf;
}
