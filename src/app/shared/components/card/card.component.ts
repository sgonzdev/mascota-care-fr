import { Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [IonIcon],
  template: `
    @if (title() || icon()) {
      <div class="card-header">
        @if (icon()) { <ion-icon [name]="icon()!" /> }
        <span>{{ title() }}</span>
      </div>
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
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 18px;
      font-size: 15px;
      font-weight: 600;
      border-bottom: 1px solid var(--color-border);
      ion-icon { font-size: 17px; color: var(--color-primary); }
    }
    .card-body { padding: 16px 18px; }
  `],
})
export class CardComponent {
  readonly title = input<string | null>(null);
  readonly icon = input<string | null>(null);
}
