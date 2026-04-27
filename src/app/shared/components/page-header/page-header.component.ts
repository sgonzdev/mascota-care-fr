import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="titles">
        <h1>{{ title() }}</h1>
        @if (subtitle()) { <p>{{ subtitle() }}</p> }
      </div>
      <div class="actions"><ng-content /></div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;

      h1 {
        font-size: 22px;
        font-weight: 600;
        letter-spacing: -0.5px;
        @media (min-width: 768px) { font-size: 28px; }
      }
      p {
        font-size: 13px;
        color: var(--color-muted-foreground);
        margin-top: 4px;
      }
      .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    }
  `],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
