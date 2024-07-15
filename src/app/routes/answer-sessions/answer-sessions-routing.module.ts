import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { formGuard } from "@shared/guards";
import { SessionComponent, SessionsComponent } from "./components";


const routes: Routes = [
  {path: '', component: SessionsComponent},
  {path: 'create', component: SessionComponent, data: {creating: true}, canDeactivate: [formGuard]},
  {path: ':id', component: SessionComponent, data: {creating: false}, canDeactivate: [formGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AnswerSessionsRoutingModule {
}
