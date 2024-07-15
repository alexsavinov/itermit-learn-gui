import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from "@shared";
import { SetsRoutingModule } from './sets-routing.module';
import { SetComponent, SetsComponent } from "./components";


@NgModule({
  declarations: [
    SetComponent,
    SetsComponent,
  ],
  imports: [
    CommonModule,
    SetsRoutingModule,
    SharedModule
  ]
})
export class SetsModule {
}
