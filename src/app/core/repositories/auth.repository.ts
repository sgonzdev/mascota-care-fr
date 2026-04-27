import { InjectionToken } from '@angular/core';
import { RolUsuario, Usuario } from '../models/consultation.model';

export interface LoginResult {
  usuario: Usuario;
  token: string;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<LoginResult>;
  loginAs(rol: RolUsuario): Promise<LoginResult>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository', {
  providedIn: 'root',
  factory: () => new InMemoryAuthRepository(),
});

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
}
