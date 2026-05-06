import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

const AUTH_PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/');
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  // Auth endpoints (login/register/refresh/logout) need credentials so the
  // HttpOnly refresh cookie is sent and accepted by the browser.
  let cloned = req;
  if (isAuthEndpoint(req.url)) {
    cloned = cloned.clone({ withCredentials: true });
  } else if (req.url.startsWith(environment.apiBaseUrl)) {
    // Same-site auth requests already opt in to credentials. For protected
    // endpoints we attach the bearer token (cookie isn't required for them).
    if (token) {
      cloned = cloned.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  }

  // Skip bearer header on public auth endpoints to avoid stale tokens.
  if (AUTH_PUBLIC_PATHS.some(p => req.url.endsWith(p))) {
    const headers = cloned.headers.delete('Authorization');
    cloned = cloned.clone({ headers });
  }

  return next(cloned);
};
