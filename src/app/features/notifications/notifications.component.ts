import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { EstadoNotificacion } from '../../core/models/notification.model';
import { CanalFilter, NotificationService } from '../../core/services/notification.service';
import { BadgeComponent, BadgeVariant } from '../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

const ESTADO_VARIANT: Record<EstadoNotificacion, BadgeVariant> = {
  ENVIADA: 'success',
  FALLIDA: 'danger',
  PENDIENTE: 'secondary',
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    DatePipe, IonIcon, BadgeComponent, ButtonComponent,
    CardComponent, EmptyStateComponent, PageHeaderComponent,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit {
  private readonly service = inject(NotificationService);

  readonly items = this.service.items;
  readonly loading = this.service.loading;
  readonly canal = this.service.canal;

  readonly filters: { label: string; value: CanalFilter }[] = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Push', value: 'PUSH' },
    { label: 'Email', value: 'EMAIL' },
    { label: 'SMS', value: 'SMS' },
  ];

  readonly estadoVariant = ESTADO_VARIANT;

  async ngOnInit(): Promise<void> {
    await this.service.refresh();
  }

  setFilter(c: CanalFilter): void { this.service.setCanal(c); }

  refresh(): void { void this.service.refresh(); }
}
