import { Component, OnInit } from '@angular/core';
import { MtxGridColumn } from "@ng-matero/extensions/grid";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { debounceTime, finalize } from "rxjs/operators";
import { PageEvent } from "@angular/material/paginator";

import { cleanJSON, User } from "@core";
import { SetsService } from "../../services";
import { FormBuilder } from "@angular/forms";
import { ICategory } from "../../../categories/interfaces";
import { CategoriesService } from "../../../categories/services";
import { UsersService } from "../../../users/services";


@Component({
  selector: 'app-sets',
  templateUrl: './sets.component.html',
  styleUrl: './sets.component.scss'
})
export class SetsComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    search: [''],
    category: [''],
    user: ['']
  });

  columns: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true},
    {header: 'custom', field: 'custom', type: 'boolean', sortable: true},
    {header: 'name', field: 'name', sortable: true},
    {header: 'category', field: 'category.name', sortable: true},
    {header: 'user', field: 'user.username', sortable: true},
    // {header: 'quizzes', field: 'quizzes.length', type: 'number', sortable: true},
    // {header: 'questions', field: 'questions.length', type: 'number', sortable: true},
    // {
    //   header: 'created',
    //   field: 'createdDate',
    //   type: 'date',
    //   sortable: true,
    //   formatter: (data: any) => dateFormat(data.createdDate)
    // },
    // {
    //   header: 'updated',
    //   field: 'lastUpdateDate',
    //   type: 'date', sortable: true,
    //   formatter: (data: any) => dateFormat(data.lastUpdateDate)
    // },
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
    userId: '',
    categoryId: '',
    custom: '',
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

  users: User[] = [];
  totalPagesUsers = 0;
  queryUsers = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  custom: '' | 'true' | 'false' = '';

  get params() {
    return Object.assign({}, this.query);
  }

  get paramsCategories() {
    return Object.assign({}, this.queryCategories);
  }

  get paramsUsers() {
    return Object.assign({}, this.queryUsers);
  }

  get search() {
    return this.reactiveForm.get('search')!;
  }

  get category() {
    return this.reactiveForm.get('category')!;
  }

  get user() {
    return this.reactiveForm.get('user')!;
  }

  constructor(
      private fb: FormBuilder,
      private setsService: SetsService,
      private categoriesService: CategoriesService,
      private usersService: UsersService,
      private translate: TranslateService,
      private router: Router,
      public activatedRoute: ActivatedRoute,
      private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.subject.pipe(debounceTime(1000)).subscribe(() => this.getList());
    this.getList();

    this.loadUsers();
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

  /* Users */

  loadUsers(append: boolean = false) {
    this.usersService
        .getAll(cleanJSON(this.paramsUsers))
        .subscribe(res => {
          if (append) {
            this.users.push(...res._embedded?.users || [])
          } else {
            this.users = res._embedded?.users || [];
          }
          this.totalPagesUsers = res.page.totalPages;
        });
  }

  filterUsers(value: string) {
    this.queryUsers.search = value;
    this.queryUsers.page = 0;
    this.loadUsers();

    return this.users;
  }

  moreUsers() {
    this.queryUsers.page = Math.min(this.totalPagesUsers, this.queryUsers.page + 1);
    this.loadUsers(true);
  }

  changeUser(user: any) {
    this.query.userId = String((user) ? user.id : '');
    this.getList();
  }

  resetUser() {
    this.query.userId = '';
    this.queryUsers.search = '';
    this.queryUsers.page = 0;
    this.reactiveForm.patchValue({user: ''});
    this.loadUsers();
  }

  /* MAIN LIST */

  getList() {
    this.isLoading = true;

    this.setsService
        .getAll(cleanJSON(this.params))
        .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
        )
        .subscribe(res => {
          this.list = res._embedded?.questionSets || [];
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
    this.query.page = 0;
    this.query.size = 10;
    this.query.search = '';
    this.query.sort = '';

    this.resetCategory();
    this.resetUser();
    this.resetCustom();

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
    this.setsService.deleteById(value.id).subscribe(() => {
      this.getList();
      this.toastrService.warning(`You have deleted set with id ${value.id}!`);
    });
  }

  changeCustom() {
    if (this.custom === 'true') {
      this.custom = 'false';
    } else if (this.custom === 'false') {
      this.custom = '';
    } else {
      this.custom = 'true';
    }

    this.query.custom = this.custom;
    this.getList();
  }

  private resetCustom() {
    this.custom = '';
    this.query.custom = '';
  }
}