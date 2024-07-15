import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { EditorComponent } from "@tinymce/tinymce-angular";

import { SharedModule } from "@shared";
import { QuestionsRoutingModule } from './questions-routing.module';
import { DialogSelectQuestionsComponent, QuestionComponent, QuestionsComponent } from "./components";


@NgModule({
  declarations: [
      QuestionComponent,
      QuestionsComponent,
      DialogSelectQuestionsComponent
  ],
  imports: [
    CommonModule,
    QuestionsRoutingModule,
    EditorComponent,
    SharedModule,
    NgOptimizedImage
  ]
})
export class QuestionsModule { }
