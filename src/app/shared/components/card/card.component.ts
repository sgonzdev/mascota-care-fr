import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [IonIcon],
  template: `
    @if (title() || icon()) {
      <header class="card-header">
        @if (icon()) {
          <span class="header-icon"><ion-icon [name]="icon()!" /></span>
        }
        <span class="header-title">{{ title() }}</span>
      </header>
    }
    <div class="card-body"><ng-content /></div>
  `,
  styles: [`
    :host {
      display: block;
      background: var(--color-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-xs);
      position: relative;
      isolation: isolate;
      transition: border-color var(--transition-base), box-shadow var(--transition-base);
    }
    :host(:hover) {
      border-color: var(--color-border-strong);
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--color-foreground-muted);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface-2);
      font-family: var(--font-sans);
    }
    .header-icon {
      width: 22px;
      height: 22px;
      border-radius: var(--radius-sm);
      background: var(--color-primary-soft);
      color: var(--color-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    .header-title { line-height: 1; }
    .card-body { padding: 20px; }
  `],
})
export class CardComponent {
  readonly title = input<string | null>(null);
  readonly icon = input<string | null>(null);
}
