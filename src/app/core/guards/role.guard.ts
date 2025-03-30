import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const RoleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const expectedRoles: string[] = route.data?.['roles'] || [];
  const userRole = localStorage.getItem('userRole');

  if (expectedRoles.includes(userRole || '')) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};
