import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

const SKIP_REFRESH_FOR = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse) || err.status !== 401) {
        return throwError(() => err);
      }
      if (SKIP_REFRESH_FOR.some(p => req.url.endsWith(p))) {
        return throwError(() => err);
      }

      // Attempt a refresh; on success retry the original request with the new token.
      return from(auth.tryRefresh()).pipe(
        switchMap(newToken => {
          if (!newToken) {
            void auth.logout();
            return throwError(() => err);
          }
          const retried = applyAuth(req, newToken);
          return next(retried);
        }),
      );
    }),
  );
};

function applyAuth<T>(req: HttpRequest<T>, token: string): HttpRequest<T> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

