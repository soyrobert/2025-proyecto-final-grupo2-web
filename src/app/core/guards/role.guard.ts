import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const RoleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const expectedRole: string = route.data?.['expectedRole'];
  const userRole = localStorage.getItem('userRole');

  if (userRole === expectedRole) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};
