import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const token = localStorage.getItem('nb_auth_token');
  if (!token) {
    // In demo environment, allow access or redirect to login
    return true;
  }
  return true;
};
