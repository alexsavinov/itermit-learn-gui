import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from "@shared";
import { SourcesRoutingModule } from './sources-routing.module';
import { SourceComponent, SourcesComponent } from "./components";


@NgModule({
  declarations: [
      SourceComponent,
      SourcesComponent
  ],
  imports: [
    CommonModule,
    SourcesRoutingModule,
    SharedModule
  ]
})
export class SourceModule { }
