import { Injectable } from '@angular/core';
import { NgxPermissionsService, NgxRolesService } from 'ngx-permissions';
import { switchMap, tap } from 'rxjs/operators';

import { AuthService, User } from '@core/authentication';
import { Menu, MenuService } from './menu.service';


export enum ROLES {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_USER = 'ROLE_USER',
  ROLE_GUEST = 'ROLE_GUEST'
}

@Injectable({
  providedIn: 'root',
})
export class StartupService {
  permissionsOfRole: any = {
    ROLE_ADMIN: ['canAdd', 'canDelete', 'canEdit', 'canRead'],
    ROLE_USER: ['canAdd', 'canEdit', 'canRead'],
    ROLE_GUEST: ['canRead'],
  };

  constructor(
    private authService: AuthService,
    private menuService: MenuService,
    private permissionsService: NgxPermissionsService,
    private rolesService: NgxRolesService) {
  }

  /**
   * Load the application only after get the menu or other essential informations
   * such as permissions and roles.
   */
  load() {
    return new Promise<void>((resolve, reject) => {
      this.authService
        .change()
        .pipe(
          tap(user => this.setPermissions(user)),
          switchMap(() => this.authService.menu()),
          tap(menu => this.setMenu(menu))
        )
        .subscribe({
          next: () => resolve(),
          error: () => resolve(),
        });
    });
  }

  private setMenu(menu: Menu[]) {
    this.menuService.addNamespace(menu, 'menu');
    this.menuService.set(menu);
  }

  private setPermissions(user: User) {
    let currentRole = ROLES.ROLE_GUEST;
    if (user.roles) {
      currentRole = user.roles[0];
    }

    const currentPermissions: string[] = this.permissionsOfRole[currentRole];

    this.permissionsService.loadPermissions(currentPermissions);
    this.rolesService.flushRoles();

    if (currentRole === ROLES.ROLE_GUEST) {
      this.rolesService.addRoles({ROLE_GUEST: currentPermissions});
    } else if (currentRole === ROLES.ROLE_USER) {
      this.rolesService.addRoles({ROLE_USER: currentPermissions});
    } else if (currentRole === ROLES.ROLE_ADMIN) {
      this.rolesService.addRoles({ROLE_ADMIN: currentPermissions});
    }
  }
}
