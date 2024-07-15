import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { formGuard } from "@shared/guards";
import { SourceComponent, SourcesComponent } from "./components";


const routes: Routes = [
  {path: '', component: SourcesComponent},
  {path: 'create', component: SourceComponent, data: {creating: true}, canDeactivate: [formGuard]},
  {path: ':id', component: SourceComponent, data: {creating: false}, canDeactivate: [formGuard]},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SourcesRoutingModule { }
