import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { EditorComponent } from "@tinymce/tinymce-angular";

import { SharedModule } from "@shared";
import { AnswerSessionsRoutingModule } from './answer-sessions-routing.module';
import {
  SessionComponent,
  SessionsComponent,
  UserSessionComponent,
  UserSessionsComponent,
  UserSessionStartComponent,
  UserSessionSummaryComponent
} from "./components";


@NgModule({
  declarations: [
      SessionsComponent,
      SessionComponent,
      UserSessionsComponent,
      UserSessionComponent,
      UserSessionStartComponent,
      UserSessionSummaryComponent
  ],
  imports: [
    CommonModule,
    AnswerSessionsRoutingModule,
    EditorComponent,
    SharedModule,
    NgOptimizedImage
  ]
})
export class AnswerSessionsModule {
}
