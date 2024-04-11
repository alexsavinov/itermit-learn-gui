import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { formGuard } from '@shared/guards/form.guard';
import { UserCreateComponent, UserEditComponent, UsersComponent } from './components';


const routes: Routes = [
  { path: '', component: UsersComponent },
  { path: 'create', component: UserCreateComponent, canDeactivate: [formGuard] },
  { path: ':id', component: UserEditComponent, canDeactivate: [formGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {
}
