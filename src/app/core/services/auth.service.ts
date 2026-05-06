import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { RolUsuario, Usuario } from '../models/consultation.model';
import { AUTH_REPOSITORY, RegisterPayload } from '../repositories/auth.repository';

const STORAGE_KEY = 'mc_session';

interface Session {
  usuario: Usuario;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly repo = inject(AUTH_REPOSITORY);
  private readonly router = inject(Router);
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

  async register(data: RegisterPayload): Promise<void> {
    const result = await this.repo.register(data);
    this.persist(result);
  }

  async logout(): Promise<void> {
    try {
      await this.repo.logout();
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      this._session.set(null);
      this.router.navigate(['/login']);
    }
  }

  /** Used by the error interceptor on 401. Returns the new access token or null. */
  async tryRefresh(): Promise<string | null> {
    const result = await this.repo.refresh();
    if (!result) return null;
    this.persist(result);
    return result.token;
  }

  /** Updates the stored access token after a refresh. */
  setSession(usuario: Usuario, token: string): void {
    this.persist({ usuario, token });
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
