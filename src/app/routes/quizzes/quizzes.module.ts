import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { EditorComponent } from "@tinymce/tinymce-angular";

import { SharedModule } from "@shared";
import { QuizzesRoutingModule } from './quizzes-routing.module';
import { DialogSelectQuizzesComponent, QuizComponent, QuizzesComponent } from "./components";


@NgModule({
  declarations: [
      QuizComponent,
      QuizzesComponent,
      DialogSelectQuizzesComponent
  ],
  imports: [
    CommonModule,
    QuizzesRoutingModule,
    EditorComponent,
    SharedModule,
    NgOptimizedImage
  ]
})
export class QuizzesModule { }
