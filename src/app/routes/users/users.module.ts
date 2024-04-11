import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';

import { SharedModule } from '@shared';
import { UsersRoutingModule } from './users-routing.module';
import { UserCreateComponent, UserEditComponent, UsersComponent } from './components';


@NgModule({
  declarations: [
    UsersComponent,
    UserCreateComponent,
    UserEditComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    UsersRoutingModule,
    NgxMaskDirective,
  ],
})
export class UsersModule { }
