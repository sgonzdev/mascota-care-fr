import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'secondary';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="badge" [ngClass]="'badge--' + variant()">
      <span class="dot"></span>
      <ng-content />
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px 4px 8px;
      border-radius: var(--radius-full);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      border: 1px solid transparent;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.85;
      }

      &--success {
        background: var(--color-success-soft);
        color: var(--color-success);
        border-color: rgba(22, 163, 74, 0.2);
      }
      &--warning {
        background: var(--color-warning-soft);
        color: #B45309;
        border-color: rgba(245, 158, 11, 0.25);
      }
      &--danger {
        background: var(--color-destructive-soft);
        color: var(--color-destructive);
        border-color: rgba(220, 38, 38, 0.2);
      }
      &--primary {
        background: var(--color-primary-soft);
        color: var(--color-primary);
        border-color: rgba(37, 99, 235, 0.2);
      }
      &--secondary {
        background: var(--color-muted);
        color: var(--color-foreground-soft);
        border-color: var(--color-border);
      }
    }
  `],
})
export class BadgeComponent {
  readonly variant = input<BadgeVariant>('primary');
}
