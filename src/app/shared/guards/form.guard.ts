import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MtxDialog } from '@ng-matero/extensions/dialog';

import { DialogLeaveComponent } from '@shared/components/dialog-leave/dialog-leave.component';
import { UserCreateComponent } from '../../routes/users/components';


export const formGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  const c = component as UserCreateComponent;

  if (c['reactiveForm'] && c['reactiveForm'].dirty && !c.isSubmitting) {
    return openConfirmDialog();
  }

  return true;
};

function openConfirmDialog(): Observable<boolean> {
  const dialog = inject(MtxDialog);

  const dialogRef = dialog.originalOpen(DialogLeaveComponent, {
    width: '400px',
  });

  return dialogRef.afterClosed().pipe(map(result => result === 'true'));
}
