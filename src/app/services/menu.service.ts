import { Injectable } from '@angular/core';
import { ROLE_MENUS, MenuGroup } from '../config/menu.config';

@Injectable({ providedIn: 'root' })
export class MenuService {
  getMenuByRole(role: string | null): MenuGroup[] {
    return role && ROLE_MENUS[role] ? ROLE_MENUS[role] : [];
  }
}
