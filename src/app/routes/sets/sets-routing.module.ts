import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { formGuard } from "@shared/guards";
import { SetComponent, SetsComponent } from "./components";


const routes: Routes = [
  {path: '', component: SetsComponent},
  {path: 'create', component: SetComponent, data: {creating: true}, canDeactivate: [formGuard]},
  {path: ':id', component: SetComponent, data: {creating: false}, canDeactivate: [formGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetsRoutingModule { }
