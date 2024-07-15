import { NgModule } from '@angular/core';

import { SharedModule } from '@shared/shared.module';
import { RoutesRoutingModule } from './routes-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomepageComponent } from '@theme/homepage/homepage.component';
import { ThemeModule } from '@theme/theme.module';
import { Error403Component, Error404Component, Error500Component, LoginComponent, RegisterComponent } from "./sessions";


const COMPONENTS: any[] = [
  DashboardComponent,
  LoginComponent,
  RegisterComponent,
  Error403Component,
  Error404Component,
  Error500Component,
  HomepageComponent
];
const COMPONENTS_DYNAMIC: any[] = [];

@NgModule({
  imports: [SharedModule, RoutesRoutingModule, ThemeModule],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
})
export class RoutesModule {}
