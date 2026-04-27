import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass, IonIcon],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [ngClass]="['btn', 'btn--' + variant(), 'btn--' + size(), full() ? 'btn--full' : '']"
    >
      @if (icon()) { <ion-icon [name]="icon()!" /> }
      <ng-content />
    </button>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input<boolean>(false);
  readonly icon = input<string | null>(null);
  readonly full = input<boolean>(false);
}
