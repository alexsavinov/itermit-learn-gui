import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { NgOptimizedImage } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileLayoutComponent } from './layout/layout.component';
import { ProfileOverviewComponent } from './overview/overview.component';
import { ProfileSettingsComponent } from './settings/settings.component';
import { ChangeAvatarComponent, ChangePasswordComponent } from './settings/dialogs';


const COMPONENTS: any[] = [
  ProfileLayoutComponent,
  ProfileOverviewComponent,
  ProfileSettingsComponent,
];
const COMPONENTS_DYNAMIC: any[] = [
  ChangePasswordComponent,
  ChangeAvatarComponent,
];

@NgModule({
  imports: [SharedModule, ProfileRoutingModule, NgOptimizedImage],
  declarations: [...COMPONENTS, ...COMPONENTS_DYNAMIC],
})
export class ProfileModule {
}
