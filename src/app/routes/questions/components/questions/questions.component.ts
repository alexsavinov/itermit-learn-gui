import { Component, OnInit } from '@angular/core';
import { MtxGridColumn } from "@ng-matero/extensions/grid";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { debounceTime, finalize } from "rxjs/operators";
import { PageEvent } from "@angular/material/paginator";

import { cleanJSON } from "@core";
import { QuestionService } from "../../services";
import { ICategory } from "../../../categories/interfaces";
import { ISource } from "../../../sources/interfaces";
import { FormBuilder } from "@angular/forms";
import { CategoriesService } from "../../../categories/services";
import { SourceService } from "../../../sources/services";


@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrl: './questions.component.scss'
})
export class QuestionsComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    search: [''],
    category: [''],
    source: ['']
  });

  columns: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true},
    {header: 'title', field: 'title', sortable: true},
    {header: 'category', field: 'category.name', sortable: true},
    {header: 'source', field: 'source.name', sortable: true},
    {
      header: this.translate.stream('dialog.operation'),
      field: 'operation',
      minWidth: 140,
      width: '140px',
      pinned: 'right',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'edit',
          tooltip: this.translate.stream('dialog.edit'),
          click: record => this.edit(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: this.translate.stream('dialog.delete'),
          pop: {
            title: this.translate.stream('dialog.confirm_delete'),
            closeText: this.translate.stream('dialog.close'),
            okText: this.translate.stream('dialog.ok'),
          },
          click: record => this.delete(record),
        },
      ],
    },
  ];

  list: any[] = [];
  total = 0;
  isLoading = true;

  query = {
    search: '',
    sourceId: '',
    categoryId: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  subject: Subject<any> = new Subject();

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

  get params() {
    return Object.assign({}, this.query);
  }

  get paramsCategories() {
    return Object.assign({}, this.queryCategories);
  }

  get paramsSource() {
    return Object.assign({}, this.querySources);
  }

  get search() {
    return this.reactiveForm.get('search')!;
  }

  get category() {
    return this.reactiveForm.get('category')!;
  }

  get source() {
    return this.reactiveForm.get('source')!;
  }

  constructor(
      private fb: FormBuilder,
      private categoriesService: CategoriesService,
      private sourceService: SourceService,
      private questionsService: QuestionService,
      private translate: TranslateService,
      private router: Router,
      public activatedRoute: ActivatedRoute,
      private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.subject.pipe(debounceTime(1000)).subscribe(() => this.getList());
    this.getList();

    this.loadSources();
    this.loadCategories();
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
    this.reactiveForm.patchValue({category: ''});
    this.query.categoryId = '';
    this.queryCategories.search = '';
    this.queryCategories.page = 0;
    this.loadCategories();
  }

  changeCategory(category: ICategory) {
    this.query.categoryId = String((category) ? category.id : '');
    this.getList();
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
    this.query.sourceId = String((source) ? source.id : '');
    this.getList();
  }

  resetSource() {
    this.reactiveForm.patchValue({source: ''});
    this.query.sourceId = '';
    this.querySources.search = '';
    this.querySources.page = 0;
    this.loadSources();
  }

  /* MAIN LIST */

  getList() {
    this.isLoading = true;

    this.questionsService
        .getAll(cleanJSON(this.params))
        .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
        )
        .subscribe(res => {
          this.list = res._embedded?.questions || [];
          this.total = res.page.totalElements;
        });
  }

  getNextPage(e: PageEvent) {
    this.query.page = e.pageIndex;
    this.query.size = e.pageSize;
    this.getList();
  }

  changeSort(e: any) {
    this.query.sort = e.active + (e.direction ? ',' + e.direction : '');
    this.getList();
  }

  reset() {
    this.reactiveForm.patchValue({search: ''});
    this.query.page = 0;
    this.query.size = 10;
    this.query.search = '';
    this.query.sort = '';

    this.resetCategory();
    this.resetSource();

    this.getList();
  }

  onKeyUp() {
    this.query.search = this.search.value;
    this.subject.next(undefined);
  }

  edit(value: any) {
    this.router.navigate([value.id], {relativeTo: this.activatedRoute});
  }

  delete(value: any) {
    this.questionsService.deleteById(value.id).subscribe(() => {
      this.getList();
      this.toastrService.warning(`You have deleted question with id ${value.id}!`);
    });
  }
}
