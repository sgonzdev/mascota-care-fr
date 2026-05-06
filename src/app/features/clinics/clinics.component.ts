import { Component, computed, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Clinica } from '../../core/models/clinic.model';
import { ClinicsService } from '../../core/services/clinics.service';
import { ToastService } from '../../core/services/toast.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-clinics',
  standalone: true,
  imports: [IonIcon, ButtonComponent, CardComponent, EmptyStateComponent, PageHeaderComponent],
  templateUrl: './clinics.component.html',
  styleUrl: './clinics.component.scss',
})
export class ClinicsComponent {
  private readonly service = inject(ClinicsService);
  private readonly toast = inject(ToastService);

  readonly clinicas = this.service.clinicas;
  readonly loading = this.service.loading;
  readonly error = this.service.error;

  readonly hasResults = computed(() => this.clinicas().length > 0);
  readonly searchPerformed = computed(() => this.error() !== null || this.hasResults());

  async search(): Promise<void> {
    await this.service.findNearby();
    const err = this.error();
    if (err) this.toast.error(err.message);
  }

  mapsUrl(c: Clinica): string {
    return `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
  }

  formatDistance(meters: number): string {
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }
}
