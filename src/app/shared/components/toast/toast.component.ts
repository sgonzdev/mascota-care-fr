import { Component, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { ToastService, ToastKind } from '../../../core/services/toast.service';

const ICONS: Record<ToastKind, string> = {
  success: 'checkmark-circle-outline',
  error: 'alert-circle-outline',
  info: 'information-circle-outline',
};

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div class="toast-stack">
      @for (t of toasts(); track t.id) {
        <div class="toast" [class]="'toast--' + t.kind" (click)="dismiss(t.id)">
          <ion-icon [name]="iconFor(t.kind)" />
          <span>{{ t.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      background: var(--color-card);
      border: 1px solid var(--color-border);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      font-size: 13px;
      cursor: pointer;
      min-width: 240px;
      max-width: 360px;
      animation: slide-in 0.2s ease;
      ion-icon { font-size: 18px; flex-shrink: 0; }
    }
    .toast--success { border-left: 3px solid var(--color-success); ion-icon { color: var(--color-success); } }
    .toast--error   { border-left: 3px solid var(--color-destructive); ion-icon { color: var(--color-destructive); } }
    .toast--info    { border-left: 3px solid var(--color-primary); ion-icon { color: var(--color-primary); } }

    @keyframes slide-in {
      from { transform: translateX(20px); opacity: 0; }
      to   { transform: translateX(0); opacity: 1; }
    }
  `],
})
export class ToastComponent {
  private readonly service = inject(ToastService);
  readonly toasts = this.service.toasts;
  iconFor(k: ToastKind) { return ICONS[k]; }
  dismiss(id: number) { this.service.dismiss(id); }
}
