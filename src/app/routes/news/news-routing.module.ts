import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { formGuard } from '@shared/guards';
import { NewsComponent, NewsDetailsComponent } from './components';


const routes: Routes = [
  { path: '', component: NewsComponent },
  {
    path: 'create',
    component: NewsDetailsComponent,
    data: { creating: true },
    canDeactivate: [formGuard]
  },
  {
    path: ':id',
    component: NewsDetailsComponent,
    data: { creating: false },
    canDeactivate: [formGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewsRoutingModule {
}
