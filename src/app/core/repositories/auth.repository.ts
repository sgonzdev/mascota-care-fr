import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InjectionToken, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RolUsuario, Usuario } from '../models/consultation.model';

export interface LoginResult {
  usuario: Usuario;
  token: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResult>;
  loginAs(rol: RolUsuario): Promise<LoginResult>;
  register(data: RegisterPayload): Promise<LoginResult>;
  refresh(): Promise<LoginResult | null>;
  logout(): Promise<void>;
  me(token: string): Promise<Usuario>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository', {
  providedIn: 'root',
  factory: () => {
    if (environment.useMocks) return new InMemoryAuthRepository();
    return new HttpAuthRepository(inject(HttpClient));
  },
});

// ---------- Backend response shapes ----------

interface BackendUser {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: 'DUENO' | 'ADMIN';
  fechaRegistro: string;
}

interface AuthTokenResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: BackendUser;
}

function mapBackendUser(u: BackendUser): Usuario {
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email,
    telefono: u.telefono ?? '',
    rol: u.rol === 'ADMIN' ? 'admin' : 'dueno',
    fechaRegistro: new Date(u.fechaRegistro),
  };
}

const QUICK_LOGIN_CREDENTIALS: Record<RolUsuario, { email: string; password: string }> = {
  dueno: { email: 'dueno@mascotacare.dev', password: 'dueno123' },
  admin: { email: 'admin@mascotacare.dev', password: 'admin123' },
};

// ---------- HTTP implementation ----------

export class HttpAuthRepository implements AuthRepository {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const res = await firstValueFrom(
      this.http.post<AuthTokenResponse>(
        `${this.base}/auth/login`,
        { email, password },
        { withCredentials: true },
      ),
    );
    return { usuario: mapBackendUser(res.user), token: res.accessToken };
  }

  loginAs(rol: RolUsuario): Promise<LoginResult> {
    const c = QUICK_LOGIN_CREDENTIALS[rol];
    return this.login(c.email, c.password);
  }

  async register(data: RegisterPayload): Promise<LoginResult> {
    const res = await firstValueFrom(
      this.http.post<AuthTokenResponse>(`${this.base}/auth/register`, data, { withCredentials: true }),
    );
    return { usuario: mapBackendUser(res.user), token: res.accessToken };
  }

  async refresh(): Promise<LoginResult | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthTokenResponse>(
          `${this.base}/auth/refresh`,
          {},
          { withCredentials: true },
        ),
      );
      return { usuario: mapBackendUser(res.user), token: res.accessToken };
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post(`${this.base}/auth/logout`, {}, { withCredentials: true }),
      );
    } catch {
      /* ignore */
    }
  }

  async me(token: string): Promise<Usuario> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const u = await firstValueFrom(
      this.http.get<BackendUser>(`${this.base}/auth/me`, { headers, withCredentials: true }),
    );
    return mapBackendUser(u);
  }
}

// ---------- In-memory implementation (kept for tests / fallback) ----------

export class InMemoryAuthRepository implements AuthRepository {
  async login(email: string, _password: string): Promise<LoginResult> {
    const rol: RolUsuario = email.startsWith('admin') ? 'admin' : 'dueno';
    return this.loginAs(rol, email);
  }

  async loginAs(rol: RolUsuario, email = `${rol}@mascotacare.dev`): Promise<LoginResult> {
    const usuario: Usuario = {
      id: rol === 'admin' ? 'admin-1' : 'u1',
      nombre: rol === 'admin' ? 'Admin Demo' : 'Carlos Mendoza',
      email,
      telefono: '+34 612 000 000',
      rol,
      fechaRegistro: new Date(),
    };
    return { usuario, token: `fake-jwt.${rol}.${Date.now()}` };
  }

  async register(data: RegisterPayload): Promise<LoginResult> {
    return this.loginAs('dueno', data.email);
  }

  async refresh(): Promise<LoginResult | null> {
    return null;
  }

  async logout(): Promise<void> {
    /* no-op */
  }

  async me(_token: string): Promise<Usuario> {
    throw new Error('InMemoryAuthRepository.me not supported');
  }
}
