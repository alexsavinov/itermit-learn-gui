import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { formGuard } from "@shared/guards";

import { QuizComponent, QuizzesComponent } from "./components";


const routes: Routes = [
  {path: '', component: QuizzesComponent},
  {path: 'create', component: QuizComponent, data: {creating: true}, canDeactivate: [formGuard]},
  {path: ':id', component: QuizComponent, data: {creating: false}, canDeactivate: [formGuard]},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuizzesRoutingModule { }
