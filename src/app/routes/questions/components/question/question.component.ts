import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { finalize } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Location } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { EditorComponent } from "@tinymce/tinymce-angular";
import { TinyMCE } from "tinymce";

import { cleanJSON } from "@core";
import { environment } from "@env/environment";
import { IQuestion } from "../../interfaces";
import { ISource } from "../../../sources/interfaces";
import { QuestionService } from "../../services";
import { SourceService } from "../../../sources/services";
import { ICategory } from "../../../categories/interfaces";
import { CategoriesService } from "../../../categories/services";


@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
    answer: ['', [Validators.required]],
    category: ['', [Validators.required]],
    source: ['', [Validators.required]]
  });

  @Input()
  creating!: boolean;
  isLoading = true;
  isSubmitting = false;

  question = {} as IQuestion;

  categories: ICategory[] = [];
  totalPagesCategories = 0;
  queryCategories = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  sources: ISource[] = [];
  sourceTitle = '';
  totalPagesSources = 0;
  querySources = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  config: EditorComponent['init'] = {
    selector: 'content_ifr',
    skin: 'oxide-dark',
    content_css: 'dark',
    branding: false,
    referrer_policy: 'origin',
    extended_valid_elements: 'img[class|src|alt|title|width|loading=lazy]',
    plugins: 'preview importcss searchreplace autolink autosave ' +
        'save directionality code visualblocks visualchars fullscreen image link ' +
        'media codesample table charmap pagebreak nonbreaking anchor ' +
        'insertdatetime advlist lists wordcount ' +
        'help charmap quickbars emoticons',
    toolbar:
        'undo redo | save | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image codesample',
    codesample_global_prismjs: true,
    codesample_languages: [
      {text: 'HTML/XML', value: 'markup'},
      {text: 'JavaScript', value: 'javascript'},
      {text: 'CSS', value: 'css'},
      {text: 'PHP', value: 'php'},
      {text: 'Ruby', value: 'ruby'},
      {text: 'Python', value: 'python'},
      {text: 'Java', value: 'java'},
      {text: 'C', value: 'c'},
      {text: 'C#', value: 'csharp'},
      {text: 'C++', value: 'cpp'},
    ],
    file_picker_types: 'image',
    image_advtab: false,
    image_description: false,
    image_dimensions: false,
    block_unsupported_drop: true,
    images_upload_credentials: true,
    theme_advanced_buttons3_add: 'save',
    save_enablewhendirty: true,
    save_onsavecallback: () => {
    },
    paste_data_images: true,
    height: 'calc(30vh - 88px)',
    images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
      this.quiestionService.saveImage(blobInfo.blob()).subscribe((data) => {
            resolve(environment.staticUrl + environment.questionImages + data.location);
          },
      );
    }),

    setup: (editor: any) => {
      this.editor = editor;
    },
  };

  editor!: TinyMCE;
  apiKey: any;

  get paramsCategories() {
    return Object.assign({}, this.queryCategories);
  }

  get paramsSources() {
    return Object.assign({}, this.querySources);
  }

  get title() {
    return this.reactiveForm.get('title')!;
  }

  get content() {
    return this.reactiveForm.get('content')!;
  }

  get answer() {
    return this.reactiveForm.get('answer')!;
  }

  get source() {
    return this.reactiveForm.get('source')!;
  }

  get category() {
    return this.reactiveForm.get('category')!;
  }

  constructor(
      private fb: FormBuilder,
      private quiestionService: QuestionService,
      private activatedRoute: ActivatedRoute,
      public dialog: MatDialog,
      private location: Location,
      private router: Router,
      private translate: TranslateService,
      private categoriesService: CategoriesService,
      private sourceService: SourceService,
      private toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.apiKey = environment.tinymceApiKey;

    this.activatedRoute.data.subscribe(({creating}) => this.creating = creating);

    this.loadSources();
    this.loadCategories();

    this.isLoading = true;
    if (!this.creating) {
      this.activatedRoute.params.subscribe(({id}) =>
          this.quiestionService.getById(id)
              .pipe(finalize(() => this.isLoading = false))
              .subscribe(res => {
                this.updateCachedValues(res);
              })
      );
    }
  }

  private updateCachedValues(data: IQuestion) {
    this.question = data;

    this.reactiveForm.patchValue({
      title: data.title,
      content: data.content,
      answer: data.answer?.content,
      category: data.category?.name,
      source: data.source?.name,
    });

    this.sourceTitle = data.source?.name || '';
  }

  /* Categories */

  loadCategories(append: boolean = false) {
    this.categoriesService
        .getAll(cleanJSON(this.paramsCategories))
        .subscribe(res => {
          if (append) {
            this.categories.push(...res._embedded?.categories || [])
          } else {
            this.categories = res._embedded?.categories || [];
          }
          this.totalPagesCategories = res.page.totalPages;
        });
  }

  filterCategories(value: string) {
    this.queryCategories.search = value;
    this.queryCategories.page = 0;
    this.loadCategories();

    return this.categories;
  }

  moreCategories() {
    this.queryCategories.page = Math.min(this.totalPagesCategories, this.queryCategories.page + 1);
    this.loadCategories(true);
  }

  resetCategory() {
    this.question.category = {name: ''};
    this.queryCategories.search = '';
    this.queryCategories.page = 0;
    this.loadCategories();
  }

  changeCategory(category: ICategory) {
    this.question.category = category;
  }

  /* Sources */

  loadSources(append: boolean = false) {
    this.isLoading = true;
    this.sourceService
        .getAll(cleanJSON(this.paramsSources))
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(res => {
          if (append) {
            this.sources.push(...res._embedded?.sources || [])
          } else {
            this.sources = res._embedded?.sources || [];
          }
          this.totalPagesSources = res.page.totalPages;
        });
  }

  filterSources(value: string) {
    this.querySources.search = value;
    this.querySources.page = 0;
    this.loadSources();

    return this.sources;
  }

  moreSources() {
    this.querySources.page = Math.min(this.totalPagesSources, this.querySources.page + 1);
    this.loadSources(true);
  }

  changeSource(source: any) {
    if ((this.question.source && this.question.source.id != source.id) || !this.source || !this.question.source) {
      this.question.source = source;
    }
  }

  resetSource() {
    this.sourceTitle = '';
    this.querySources.search = '';
    this.querySources.page = 0;
    this.loadSources();
  }

  /* Question */

  save() {
    this.isSubmitting = true;

    this.question = {
      ...this.question,
      title: this.title.value,
      content: this.content.value,
      answer: {...this.question.answer, content: this.answer.value},
    };

    if (this.creating) {
      this.quiestionService.create(this.question)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: IQuestion) => {
              this.updateCachedValues(res);
              this.reactiveForm.markAsPristine();
              this.creating = false;
              this.location.replaceState(`/admin/questions/${res.id}`);
              this.toastrService.success(`Question created!`);
            },
            error: e => {
              console.log(e);
            },
          });
    } else {
      this.quiestionService.update(this.question)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: IQuestion) => {
              this.updateCachedValues(res);
              this.reactiveForm.markAsPristine();
              this.toastrService.info(`Question id ${res.id} updated!`);
            },
            error: e => {
              console.log(e);
            },
          });
    }
  }
}
