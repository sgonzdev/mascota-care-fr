import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TipoGuia } from '../../core/models/guide.model';
import { GuideService } from '../../core/services/guide.service';
import { PetService } from '../../core/services/pet.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { FormFieldComponent } from '../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [
    DatePipe, ReactiveFormsModule, ButtonComponent, CardComponent,
    EmptyStateComponent, FormFieldComponent, PageHeaderComponent,
  ],
  templateUrl: './guides.component.html',
  styleUrl: './guides.component.scss',
})
export class GuidesComponent {
  private readonly pets = inject(PetService);
  private readonly guides = inject(GuideService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly myPets = this.pets.myPets;
  readonly history = this.guides.history;
  readonly current = this.guides.current;
  readonly loading = this.guides.loading;

  readonly tipos: { value: TipoGuia; label: string }[] = [
    { value: 'CUIDADO', label: 'Cuidado general' },
    { value: 'ALIMENTACION', label: 'Alimentación' },
    { value: 'ALARMA', label: 'Señales de alarma' },
  ];

  readonly form = inject(FormBuilder).nonNullable.group({
    idMascota: ['', Validators.required],
    tipo: ['CUIDADO' as TipoGuia, Validators.required],
  });

  readonly selectedPet = computed(() =>
    this.myPets().find(m => m.id === this.form.controls.idMascota.value) ?? null,
  );

  constructor() {
    effect(() => {
      const first = this.myPets()[0];
      if (first && !this.form.controls.idMascota.value) {
        this.form.patchValue({ idMascota: first.id });
      }
    });
    effect(() => {
      const id = this.form.controls.idMascota.value;
      if (id) void this.guides.loadHistory(id);
    });
  }

  async generate(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const pet = this.selectedPet();
    if (!pet) return;
    const { tipo } = this.form.getRawValue();
    await this.guides.generate({
      idMascota: pet.id, tipo, especie: pet.especie,
      raza: pet.raza, edadMeses: pet.edadMeses,
    });
  }

  showHistorical(id: string): void {
    const found = this.history().find(g => g.id === id) ?? null;
    this.guides.setCurrent(found);
  }

  safeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
