import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <header class="page-header">
      <div class="titles">
        <h1>{{ title() }}</h1>
        @if (subtitle()) { <p class="subtitle">{{ subtitle() }}</p> }
      </div>
      <div class="actions"><ng-content /></div>
    </header>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 20px;
      margin-bottom: var(--space-8);
      padding-bottom: var(--space-5);
      border-bottom: 1px solid var(--color-border);
      flex-wrap: wrap;

      h1 {
        font-family: var(--font-display);
        font-size: 30px;
        font-weight: 500;
        letter-spacing: -0.03em;
        line-height: 1;
        margin: 0;

        @media (min-width: 768px) { font-size: 38px; }
      }
      .subtitle {
        font-family: var(--font-mono);
        font-size: 11px;
        color: var(--color-foreground-muted);
        margin-top: var(--space-3);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 500;
      }
      .actions {
        display: flex;
        gap: var(--space-2);
        flex-wrap: wrap;
        align-items: center;
      }
    }
  `],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
