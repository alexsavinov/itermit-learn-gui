import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { EditorComponent } from "@tinymce/tinymce-angular";
import { TinyMCE } from "tinymce";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Location } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { finalize } from "rxjs/operators";
import { MtxGridColumn } from "@ng-matero/extensions/grid";

import { environment } from "@env/environment";
import { cleanJSON } from "@core";
import { emptyITableCell } from "@shared";
import { IQuiz } from "../../interfaces";
import { ISource } from "../../../sources/interfaces";
import { QuizService } from "../../services";
import { SourceService } from "../../../sources/services";
import { ICategory } from "../../../categories/interfaces";
import { CategoriesService } from "../../../categories/services";


@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    content: ['', [Validators.required]],
    category: ['', [Validators.required]],
    source: ['', [Validators.required]]
  });

  @Input()
  creating!: boolean;
  isLoading = true;
  isSubmitting = false;

  quiz: IQuiz = {} as IQuiz;

  quizAnswers: any[] = [];
  quizAnswersSelected: any[] = [];

  categories: ICategory[] = [];
  totalPagesCategories = 0;
  queryCategories = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  sources: ISource[] = [];
  totalPagesSources = 0;
  querySources = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  tableCell = emptyITableCell();

  columnsQuizAnswers: MtxGridColumn[] = [
    {
      header: 'id',
      field: 'id',
      type: 'number',
      width: '80px',
      sortable: true
    },
    {
      header: 'content',
      field: 'content',
      sortable: true,
    },
    {
      header: 'sequence',
      field: 'sequence',
      type: 'number',
      width: '140px',
      sortable: true
    },
    {
      header: 'correct',
      field: 'correct',
      type: 'boolean',
      width: '140px',
      sortable: true
    },
  ];

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
        'help charmap quickbars emoticons code',
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
      this.quizService.saveImage(blobInfo.blob()).subscribe((data) => {
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

  get paramsSource() {
    return Object.assign({}, this.querySources);
  }

  get title() {
    return this.reactiveForm.get('title')!;
  }

  get content() {
    return this.reactiveForm.get('content')!;
  }

  get category() {
    return this.reactiveForm.get('category')!;
  }

  get source() {
    return this.reactiveForm.get('source')!;
  }

  constructor(
      private fb: FormBuilder,
      private quizService: QuizService,
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
          this.quizService.getById(id)
              .pipe(finalize(() => this.isLoading = false))
              .subscribe(res => {
                this.updateCachedValues(res);
              }),
      );
    }
  }

  private updateCachedValues(data: IQuiz) {
    this.quiz = data;
    this.quizAnswers = data.quizAnswers || [];

    this.sortQuizAnswers();
    this.changeTableSelectedRows([]);

    this.reactiveForm.patchValue({
      title: data.title,
      content: data.content,
      category: data.category?.name,
      source: data.source?.name,
    });
  }

  sortQuizAnswers() {
    this.quizAnswers = this.quizAnswers.sort(
        ({sequence: a}, {sequence: b}) => {
          if (a == undefined || b == undefined) return 0
          else if (a > b) return 1;
          else if (a < b) return -1;
          else return 0;
        });
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
    this.quiz.category = {name: ''};
    this.queryCategories.search = '';
    this.queryCategories.page = 0;
    this.loadCategories();
  }

  changeCategory(category: ICategory) {
    this.quiz.category = category;
  }

  /* Sources */

  loadSources(append: boolean = false) {
    this.isLoading = true;
    this.sourceService
        .getAll(cleanJSON(this.paramsSource))
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
    if ((this.quiz.source && this.quiz.source.id != source.id) || !this.source || !this.quiz.source) {
      this.quiz.source = source;
    }
  }

  resetSource() {
    this.querySources.search = '';
    this.querySources.page = 0;
    this.loadSources();
  }

  /* Question */

  save() {
    this.isSubmitting = true;

    this.quiz = {
      ...this.quiz,
      title: this.title.value,
      content: this.content.value,
      quizAnswers: this.quizAnswers
    };

    if (this.creating) {
      this.quizService.create(this.quiz)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: IQuiz) => {
              this.updateCachedValues(res);

              this.reactiveForm.markAsPristine();
              this.creating = false;
              this.location.replaceState(`/admin/quizzes/${res.id}`);
              this.toastrService.success(`Quiz created!`);
            },
            error: e => {
              console.log(e);
            },
          });
    } else {
      this.quizService.update(this.quiz)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: IQuiz) => {
              this.updateCachedValues(res);

              this.reactiveForm.markAsPristine();
              this.toastrService.info(`Quiz id ${res.id} updated!`);
            },
            error: e => {
              console.log(e);
            },
          });
    }
  }

  changeTableSelectedRows(rows: any) {
    this.quizAnswersSelected = rows;
  }

  changeCellInputVisibility(index: string, col: any) {
    this.tableCell.editFinished = !this.tableCell.editFinished;
    if (this.tableCell.editFinished) {
      this.tableCell.visibleRow = index;
      this.tableCell.visibleColumn = col.field;
      this.tableCell.editFinished = false;
    }
  }

  changeTableCheckbox(e: any, row: any, col: any) {
    if (e.source.checked) {
      this.quizAnswers.forEach(a => a[col.field] = false);
      row[col.field] = true;
      this.reactiveForm.markAsDirty();
    } else {
      e.source.checked = true;
    }
  }

  isCellEditable(index: any, col: any) {
    return this.tableCell.visibleRow === index
        && this.tableCell.visibleColumn === col.field
        && !col.disabled;
  }

  tableCellFinishEditing() {
    this.tableCell.visibleRow = '';
    this.tableCell.visibleColumn = '';
    this.tableCell.editFinished = true;
    this.reactiveForm.markAsDirty();
  }

  deleteQuizAnswers() {
    this.quizAnswers = this.quizAnswers.filter(a => this.quizAnswersSelected.indexOf(a) === -1);
    this.reactiveForm.markAsDirty();
  }

  addQuizAnswer() {
    this.quizAnswers= [...this.quizAnswers, {content: '', sequence: 0}];
    this.reactiveForm.markAsDirty();
    this.changeTableSelectedRows([]);
  }
}
