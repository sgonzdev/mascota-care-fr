import { Component, computed, inject, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';
import { NavSection } from './nav.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IonIcon],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly navigate = output<void>();
  readonly usuario = this.auth.usuario;
  readonly isAdmin = this.auth.isAdmin;

  readonly sections = computed<NavSection[]>(() => {
    const base: NavSection[] = [
      {
        title: 'Panel Principal',
        items: [
          { label: 'Resumen', icon: 'grid-outline', route: '/dashboard' },
          { label: 'Consultas', icon: 'pulse-outline', route: '/consultations' },
          { label: 'Nueva Consulta', icon: 'add-circle-outline', route: '/consultations/new' },
          { label: 'Registrar Mascota', icon: 'paw-outline', route: '/pets/new' },
        ],
      },
    ];
    if (this.isAdmin()) {
      base.push({
        title: 'Administración',
        items: [
          { label: 'Métricas', icon: 'bar-chart-outline', route: '/metrics' },
          { label: 'Motor de Reglas', icon: 'git-merge-outline', route: '/admin/rules' },
        ],
      });
    }
    return base;
  });

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
    this.navigate.emit();
  }
}
