import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from "rxjs/operators";
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from "@ngx-translate/core";
import { MtxDialog } from "@ng-matero/extensions/dialog";
import { MtxGridColumn } from "@ng-matero/extensions/grid";

import { AuthService, cleanJSON, User } from '@core';
import { ISet } from '../../interfaces';
import { IQuiz } from "../../../quizzes/interfaces";
import { ICategory } from "../../../categories/interfaces";
import { SetsService } from '../../services';
import { UsersService } from "../../../users/services";
import { CategoriesService } from "../../../categories/services";
import { DialogSelectQuizzesComponent } from "../../../quizzes/components";
import { DialogSelectQuestionsComponent } from "../../../questions/components";


@Component({
  selector: 'app-set',
  templateUrl: './set.component.html',
  styleUrl: './set.component.scss'
})
export class SetComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    user: [''],
    category: ['', [Validators.required]],
    name: [''],
    custom: [false]
  });

  @Input()
  creating!: boolean;
  isLoading = true;
  isSubmitting = false;

  set = {} as ISet;
  quizzes: any[] = [];
  questions: any[] = [];
  quizzesSelected: any[] = [];
  questionsSelected: any[] = [];

  users: User[] = [];
  totalPagesUsers = 0;
  queryUsers = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 5,
  };

  categories: ICategory[] = [];
  totalPagesCategories = 0;
  queryCategories = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  columnsQuizzes: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true, showExpand: true},
    {
      header: 'title',
      field: 'title',
      sortable: true,
      formatter: (data: any) => this.shortener(data.title)
    },
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
          click: record => this.editQuiz(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: this.translate.stream('dialog.delete'),
          click: record => this.deleteQuiz(record),
        },
      ],
    },
  ];

  columnsQuestions: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true, showExpand: true},
    {header: 'title', field: 'title', sortable: true},
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
          click: record => this.editQuestion(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: this.translate.stream('dialog.delete'),
          click: record => this.deleteQuestion(record),
        },
      ],
    },
  ];

  get paramsUsers() {
    return Object.assign({}, this.queryUsers);
  }

  get paramsCategories() {
    return Object.assign({}, this.queryCategories);
  }

  get user() {
    return this.reactiveForm.get('user')!;
  }

  get category() {
    return this.reactiveForm.get('category')!;
  }

  get custom() {
    return this.reactiveForm.get('custom')!;
  }

  get name() {
    return this.reactiveForm.get('name')!;
  }

  constructor(
      private fb: FormBuilder,
      private auth: AuthService,
      private setsService: SetsService,
      private activatedRoute: ActivatedRoute,
      public dialog: MtxDialog,
      private location: Location,
      private router: Router,
      private translate: TranslateService,
      private usersService: UsersService,
      private categoiresService: CategoriesService,
      private toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({creating}) => this.creating = creating);

    this.loadUsers();
    this.loadCategories();

    this.isLoading = true;
    if (this.creating) {
      this.reactiveForm.markAsDirty();
      this.auth.user()
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(user => {
            this.set.user = user;
            this.reactiveForm.patchValue({user: user.username});
          });
    } else {
      this.activatedRoute.params.subscribe(({id}) =>
          this.setsService.getById(id)
              .pipe(finalize(() => this.isLoading = false))
              .subscribe(res => {
                this.updateCachedValues(res);
              }),
      );
    }
  }

  private updateCachedValues(data: ISet) {
    this.set = data;
    this.quizzes = data.quizzes || [];
    this.questions = data.questions || [];

    this.changeQuizzesSelectedRows([]);
    this.changeQuestionsSelectedRows([]);

    this.reactiveForm.patchValue({
      custom: data.custom,
      name: data.name,
      user: data.user?.username,
      category: data.category?.name
    });
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
  }

  moreUsers() {
    this.queryUsers.page = Math.min(this.totalPagesUsers, this.queryUsers.page + 1);
    this.loadUsers(true);
  }

  changeUser(user: User) {
    this.set.user = user;
  }

  resetUser() {
    this.set.user = {};
    this.queryUsers.search = '';
    this.queryUsers.page = 0;
    this.loadUsers();
  }

  /* Categories */

  loadCategories(append: boolean = false) {
    this.categoiresService
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

  changeCategory(category: ICategory) {
    this.set.category = category;
  }

  resetCategory() {
    this.set.category = {name: ''};
    this.queryCategories.search = '';
    this.queryCategories.page = 0;
    this.loadCategories();
  }

  /* Set */

  save() {
    this.isSubmitting = true;

    this.set = {
      ...this.set,
      name: this.name.value,
      quizzes: this.quizzes,
      questions: this.questions
    }

    if (this.creating) {
      this.setsService.create(this.set)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: ISet) => {
              this.updateCachedValues(res);
              this.creating = false;
              this.reactiveForm.markAsPristine();
              this.location.replaceState(`/admin/sets/${res.id}`);
              this.toastrService.success(`Set created!`);
            },
            error: e => {
              console.log(e);
            },
          });
    } else {
      this.setsService.update(this.set)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: ISet) => {
              this.updateCachedValues(res);
              this.reactiveForm.markAsPristine();
              this.toastrService.info(`Set id ${res.id} updated!`);
            },
            error: e => {
              console.log(e);
            },
          });
    }
  }

  editQuiz(value: any) {
    this.router.navigateByUrl(`/admin/quizzes/${value.id}`).then();
  }

  editQuestion(value: any) {
    this.router.navigateByUrl(`/admin/questions/${value.id}`).then();
  }

  deleteQuiz(value: any) {
    this.quizzes = this.quizzes.filter(a => value.id !== a.id);
    this.quizzesSelected = [];
    this.reactiveForm.markAsDirty();
  }

  deleteQuestion(value: any) {
    this.questions = this.questions.filter(a => value.id !== a.id);
    this.questionsSelected = [];
    this.reactiveForm.markAsDirty();
  }

  deleteQuizzes() {
    this.quizzes = this.quizzes.filter(a => this.quizzesSelected.indexOf(a) === -1);
    this.reactiveForm.markAsDirty();
    this.quizzesSelected = [];
  }

  deleteQuestions() {
    this.questions = this.questions.filter(a => this.questionsSelected.indexOf(a) === -1);
    this.reactiveForm.markAsDirty();
    this.questionsSelected = [];
  }

  changeQuizzesSelectedRows(rows: any) {
    this.quizzesSelected = rows;
  }

  changeQuestionsSelectedRows(rows: any) {
    this.questionsSelected = rows;
  }

  private shortener(value: string): string {
    const size = 30;
    return value.substring(0, size) + (value.length > size ? '..' : '')
  }

  addQuiz() {
    const dialogRef = this.dialog.originalOpen(DialogSelectQuizzesComponent,
        {
          width: '80%',
          height: '80%',
          data: {category: this.set.category}
        }
    );
    dialogRef.afterClosed().subscribe((result: IQuiz[]) => {
      if (result.length) {
        this.quizzes = this.quizzes.concat(result.filter(a => this.quizzes.every(b => b.id !== a.id)));
        this.reactiveForm.markAsDirty();
      }
    });
  }

  addQuestion() {
    const dialogRef = this.dialog.originalOpen(DialogSelectQuestionsComponent,
        {
          width: '80%',
          height: '80%',
          data: {category: this.set.category}
        }
    );
    dialogRef.afterClosed().subscribe((result: IQuiz[]) => {
      if (result.length) {
        this.questions = this.questions.concat(result.filter(a => this.questions.every(b => b.id !== a.id)));
        this.reactiveForm.markAsDirty();
      }
    });
  }

  changeCustom() {
    this.set.custom = !this.set.custom;
  }
}
