import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles: UserRole[] = route.data['roles'] || [];
  const currentRoles = authService.userRoles();

  const hasRequiredRole = currentRoles.some((r) => expectedRoles.includes(r));

  if (hasRequiredRole) {
    return true;
  }

  // Not authorized for this role
  router.navigate(['/dashboard']);
  return false;
};
