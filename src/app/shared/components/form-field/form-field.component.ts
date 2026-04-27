import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div class="field">
      <label>{{ label() }} @if (required()) { <span class="req">*</span> }</label>
      <ng-content />
      @if (error()) { <span class="error">{{ error() }}</span> }
      @else if (hint()) { <span class="hint">{{ hint() }}</span> }
    </div>
  `,
  styles: [`
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;

      label {
        font-size: 12px;
        font-weight: 600;
        color: var(--color-foreground);
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .req { color: var(--color-destructive); }
      .hint { font-size: 12px; color: var(--color-muted-foreground); }
      .error { font-size: 12px; color: var(--color-destructive); }
    }
  `],
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly required = input<boolean>(false);
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
}
