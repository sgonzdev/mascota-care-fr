import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IonIcon],
  template: `
    <div class="empty">
      <div class="icon-wrap"><ion-icon [name]="icon()" /></div>
      <h3>{{ title() }}</h3>
      @if (description()) { <p>{{ description() }}</p> }
      <div class="actions"><ng-content /></div>
    </div>
  `,
  styles: [`
    .empty {
      padding: 48px 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .icon-wrap {
      width: 56px; height: 56px;
      border-radius: 50%;
      background: var(--color-secondary);
      color: var(--color-primary);
      display: flex; align-items: center; justify-content: center;
      font-size: 28px;
      margin-bottom: 4px;
    }
    h3 { font-size: 16px; font-weight: 600; }
    p { font-size: 13px; color: var(--color-muted-foreground); max-width: 320px; }
    .actions { margin-top: 10px; }
  `],
})
export class EmptyStateComponent {
  readonly icon = input<string>('information-circle-outline');
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
}
