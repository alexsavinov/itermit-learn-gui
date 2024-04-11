import { NgModule } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { EditorComponent } from '@tinymce/tinymce-angular';

import { SharedModule } from '@shared';
import { NewsRoutingModule } from './news-routing.module';
import { NewsComponent, NewsDetailsComponent, NewsShowComponent } from './components';


@NgModule({
  declarations: [
    NewsComponent,
    NewsDetailsComponent,
    NewsShowComponent
  ],
  imports: [
    CommonModule,
    NewsRoutingModule,
    EditorComponent,
    SharedModule,
    NgOptimizedImage,
  ]
})
export class NewsModule {
}
