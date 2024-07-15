import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Location } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { finalize } from "rxjs/operators";
import { MatTabChangeEvent } from "@angular/material/tabs";

import { AuthService, cleanJSON, User } from "@core";
import { ISessionStartRequest } from "../../interfaces";
import { ISource } from "../../../sources/interfaces";
import { ICategory } from "../../../categories/interfaces";
import { ISet } from "../../../sets/interfaces";
import { SessionsService } from "../../services";
import { SourceService } from "../../../sources/services";
import { CategoriesService } from "../../../categories/services";
import { SetsService } from "../../../sets/services";

@Component({
  selector: 'app-user-session-start',
  templateUrl: './user-session-start.component.html',
  styleUrl: './user-session-start.component.scss'
})
export class UserSessionStartComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    user: [''],
    set: [''],
    category: ['', Validators.required],
    source: [''],
    totalItems: [10, [Validators.min(5), Validators.max(50)]],
  });

  isLoading = true;
  isSubmitting = false;

  _source!: ISource;
  sources: ISource[] = [];
  totalPagesSources = 0;
  querySources = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  _category!: ICategory;
  categories: ICategory[] = [];
  totalPagesCategories = 0;
  queryCategories = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  _set!: ISet;
  sets: ISet[] = [];
  totalPagesSets = 0;
  querySets = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  _user!: User;

  mode: 'QUIZZES' | 'QUESTIONS' | 'MIXED' = 'MIXED';
  usage: 'MANUAL' | 'AUTOMATIC' = 'AUTOMATIC';

  get paramsSources() {
    return Object.assign({}, this.querySources);
  }

  get paramsCategories() {
    return Object.assign({}, this.queryCategories);
  }

  get paramsSets() {
    return Object.assign({}, this.querySets);
  }

  get user() {
    return this.reactiveForm.get('user')!;
  }

  get set() {
    return this.reactiveForm.get('set')!;
  }

  get source() {
    return this.reactiveForm.get('source')!;
  }

  get category() {
    return this.reactiveForm.get('category')!;
  }

  get totalItems() {
    return this.reactiveForm.get('totalItems')!;
  }

  constructor(
      private fb: FormBuilder,
      private activatedRoute: ActivatedRoute,
      public dialog: MatDialog,
      private location: Location,
      private router: Router,
      private translate: TranslateService,
      private sourceService: SourceService,
      private categoriesService: CategoriesService,
      private setsService: SetsService,
      private sessionsService: SessionsService,
      private auth: AuthService,
      private toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.isLoading = true;

    this.loadSources();
    this.loadCategories();
    this.loadSets();

    this.auth.user()
        .subscribe(user => {
          this._user = user;
          this.reactiveForm.patchValue({user: user.username});
        });
  }

  /* Sources */

  loadSources(append: boolean = false) {
    this.sourceService
        .getAll(cleanJSON(this.paramsSources))
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

  resetSource() {
    this.querySources.search = '';
    this.querySources.page = 0;
    this.loadSources();

    this._set = {};
    this.reactiveForm.patchValue({set: ''});
  }

  changeSource(source: ISource) {
    this._source = source;
    this._set = {};
    this.reactiveForm.patchValue({set: ''});
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
    this._category = {name: ''};
    this.queryCategories.search = '';
    this.queryCategories.page = 0;
    this.loadCategories();

    this._set = {};
    this.reactiveForm.patchValue({set: ''});
  }

  changeCategory(category: ICategory) {
    this._category = category;
    this._set = {};
    this.reactiveForm.patchValue({set: ''});
  }

  /* Sets */

  loadSets(append: boolean = false) {
    this.setsService
        .getAll(cleanJSON(this.paramsSets))
        .subscribe(res => {
          if (append) {
            this.sets.push(...res._embedded?.questionSets || [])
          } else {
            this.sets = res._embedded?.questionSets || [];
          }
          this.totalPagesSets = res.page.totalPages;
        });
  }

  filterSets(value: string) {
    this.querySets.search = value;
    this.querySets.page = 0;
    this.loadSets();

    return this.sets;
  }

  moreSets() {
    this.querySets.page = Math.min(this.totalPagesSets, this.querySets.page + 1);
    this.loadSets(true);
  }

  resetSet() {
    this._set = {name: ''};
    this.querySets.search = '';
    this.querySets.page = 0;
    this.loadSets();
  }

  changeSet(set: ISet) {
    this._set = set;
  }

  start() {
    this.isSubmitting = true;

    var request = {user: this._user} as ISessionStartRequest;

    if (this.usage === 'MANUAL') {
      request.questionSet = this._set;
    } else {
      request.mode = this.mode;
      request.totalItems = this.totalItems.value;
      request.category = this._category;
      request.source = this._source;
    }

    this.sessionsService
        .start(request)
        .pipe(finalize(() => this.isSubmitting = false))
        .subscribe(res => {
          console.log(res)
          this.router.navigate(['sessions', res.id]);
        });
  }

  tabChange(e: MatTabChangeEvent) {
    this.usage = (e.tab.textLabel === 'MANUAL') ? 'MANUAL' : "AUTOMATIC";
  }

  changeTotalItems(e: any) {
    this.reactiveForm.patchValue({totalItems: e});
  }
}
