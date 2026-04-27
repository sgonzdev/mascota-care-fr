import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'pets/new',
        loadComponent: () => import('./features/pets/pet-register.component').then(m => m.PetRegisterComponent),
      },
      {
        path: 'consultations',
        loadComponent: () => import('./features/consultations/consultation-list.component').then(m => m.ConsultationListComponent),
      },
      {
        path: 'consultations/new',
        loadComponent: () => import('./features/consultations/new/consultation-new.component').then(m => m.ConsultationNewComponent),
      },
      {
        path: 'consultations/:id',
        loadComponent: () => import('./features/consultations/detail/consultation-detail.component').then(m => m.ConsultationDetailComponent),
      },
      {
        path: 'consultations/:id/followup',
        loadComponent: () => import('./features/consultations/followup/followup.component').then(m => m.FollowupComponent),
      },
      {
        path: 'metrics',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/metrics/metrics.component').then(m => m.MetricsComponent),
      },
      {
        path: 'admin/rules',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/rules-admin/rules-admin.component').then(m => m.RulesAdminComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
