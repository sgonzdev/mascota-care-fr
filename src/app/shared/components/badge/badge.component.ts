import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'secondary';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="badge" [ngClass]="'badge--' + variant()">
      <ng-content />
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;

      &--success { background: var(--color-success); color: var(--color-success-foreground); }
      &--warning { background: var(--color-warning); color: var(--color-warning-foreground); }
      &--danger  { background: var(--color-destructive); color: var(--color-destructive-foreground); }
      &--primary { background: var(--color-primary); color: var(--color-primary-foreground); }
      &--secondary { background: var(--color-secondary); color: var(--color-secondary-foreground); }
    }
  `],
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('primary');
}
