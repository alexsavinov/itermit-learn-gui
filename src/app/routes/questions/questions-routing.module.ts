import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { formGuard } from "@shared/guards";

import { QuestionComponent, QuestionsComponent } from "./components";


const routes: Routes = [
  {path: '', component: QuestionsComponent},
  {path: 'create', component: QuestionComponent, data: {creating: true}, canDeactivate: [formGuard]},
  {path: ':id', component: QuestionComponent, data: {creating: false}, canDeactivate: [formGuard]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionsRoutingModule { }
