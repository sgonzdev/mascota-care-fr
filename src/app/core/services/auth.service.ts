import { Injectable, computed, inject, signal } from '@angular/core';
import { RolUsuario, Usuario } from '../models/consultation.model';
import { AUTH_REPOSITORY } from '../repositories/auth.repository';

const STORAGE_KEY = 'mc_session';

interface Session {
  usuario: Usuario;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly repo = inject(AUTH_REPOSITORY);
  private readonly _session = signal<Session | null>(this.restore());

  readonly usuario = computed(() => this._session()?.usuario ?? null);
  readonly token = computed(() => this._session()?.token ?? null);
  readonly isLoggedIn = computed(() => this._session() !== null);
  readonly isAdmin = computed(() => this.usuario()?.rol === 'admin');

  async login(email: string, password: string): Promise<void> {
    const result = await this.repo.login(email, password);
    this.persist(result);
  }

  async loginAs(rol: RolUsuario): Promise<void> {
    const result = await this.repo.loginAs(rol);
    this.persist(result);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._session.set(null);
  }

  private persist(session: Session): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this._session.set(session);
  }

  private restore(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      s.usuario.fechaRegistro = new Date(s.usuario.fechaRegistro);
      return s;
    } catch {
      return null;
    }
  }
}
