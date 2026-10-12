import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        authService.logout();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        console.warn('[RBAC Security] 403 Forbidden:', error.error?.error || error.message);
      }

      const errorMessage = error.error?.error || error.error?.message || error.statusText;
      return throwError(() => new Error(errorMessage));
    })
  );
};
