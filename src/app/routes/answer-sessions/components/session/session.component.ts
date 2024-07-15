import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';
import { finalize } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { MtxGridColumn } from "@ng-matero/extensions/grid";

import { AuthService, cleanJSON, User } from '@core';
import { emptyITableCell } from "@shared";
import { ISession } from "../../interfaces";
import { SessionsService } from "../../services/sessions.service";
import { UsersService } from "../../../users/services";
import { ISet } from "../../../sets/interfaces";
import { SetsService } from "../../../sets/services";


@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    user: ['', [Validators.required]],
    set: ['', [Validators.required]],
    finishedDate: ['']
  });

  @Input()
  creating!: boolean;
  isLoading = true;
  isSubmitting = false;

  session = {} as ISession;
  quizAnswers: any[] = [];
  userAnswers: any[] = [];
  quizAnswersSelected: any[] = [];
  userAnswersSelected: any[] = [];

  tableCell = emptyITableCell();

  users: User[] = [];
  userTitle = '';
  totalPagesUsers = 0;
  queryUsers = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  sets: ISet[] = [];
  totalPagesSets = 0;
  querySets = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  columnsQuizAnswers: MtxGridColumn[] = [
    {header: 'ID', field: 'id', type: 'number', width: '100px', sortable: true, showExpand: true},
    {header: 'quiz ID', field: 'quiz.id', type: 'number', width: '80px', sortable: true},
    {
      header: 'content',
      field: 'content',
      sortable: true,
      formatter: (data: any) => this.shortener(data.content)
    },
    {header: 'sequence', field: 'sequence', type: 'number', sortable: true},
    {header: 'correct', field: 'correct', type: 'boolean', sortable: true},
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
          click: record => this.editQuizAnswer(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: this.translate.stream('dialog.delete'),
          click: record => this.deleteQuizAnswer(record),
        },
      ],
    },
  ];

  columnsUserAnswers: MtxGridColumn[] = [
    {header: 'ID', field: 'id', type: 'number', width: '80px', sortable: true, showExpand: true},
    {header: 'question ID', field: 'question.id', type: 'number', width: '80px', sortable: true},
    {
      header: 'content',
      field: 'content',
      sortable: true,
      formatter: (data: any) => this.shortener(data.content)
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
          click: record => this.editUserAnswer(record),
        },
        {
          type: 'icon',
          color: 'warn',
          icon: 'delete',
          tooltip: this.translate.stream('dialog.delete'),
          // pop: {
          //   title: this.translate.stream('dialog.confirm_delete'),
          //   closeText: this.translate.stream('dialog.close'),
          //   okText: this.translate.stream('dialog.ok'),
          // },
          click: record => this.deleteUserAnswer(record),
        },
      ],
    },
  ];

  get paramsUsers() {
    return Object.assign({}, this.queryUsers);
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

  get finishedDate() {
    return this.reactiveForm.get('finishedDate')!;
  }

  constructor(
      private fb: FormBuilder,
      private auth: AuthService,
      private sessionsService: SessionsService,
      private activatedRoute: ActivatedRoute,
      public dialog: MatDialog,
      private location: Location,
      private router: Router,
      private translate: TranslateService,
      private usersService: UsersService,
      private setsService: SetsService,
      private toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({creating}) => this.creating = creating);

    this.loadUsers();
    this.loadSets();

    this.isLoading = true;
    if (this.creating) {
      this.reactiveForm.markAsDirty();
      this.auth.user()
          .pipe(finalize(() => this.isLoading = false))
          .subscribe(user => {
            this.userTitle = user.username || '';
            this.session.user = user;

            this.reactiveForm.patchValue({
              user: user.username,
            });
          });
    } else {
      this.activatedRoute.params.subscribe(({id}) =>
          this.sessionsService.getById(id)
              .pipe(finalize(() => this.isLoading = false))
              .subscribe(res => {
                this.updateCachedValues(res);
              }),
      );
    }
  }

  private updateCachedValues(data: ISession) {
    this.session = data;
    this.quizAnswers = data.quizAnswers || [];
    this.userAnswers = data.userAnswers || [];

    this.changeQuizAnswersSelectedRows([]);
    this.changeUserAnswersSelectedRows([]);

    this.reactiveForm.patchValue({
      user: data.user?.username,
      set: data.questionSet?.name,
      finishedDate: data.finishedDate
    });
  }

  /* Users */

  loadUsers(append: boolean = false) {
    this.isLoading = true;

    this.usersService
        .getAll(cleanJSON(this.paramsUsers))
        .pipe(finalize(() => this.isLoading = false))
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
    if ((this.session.user && this.session.user.id != user.id) || !this.user.value) {
      this.session.user = user;
      this.reactiveForm.patchValue({
        user: user.username,
      });
      this.reactiveForm.markAsDirty();
    }
  }

  resetUser() {
    this.session.user = undefined;
    this.userTitle = '';
    this.queryUsers.search = '';
    this.queryUsers.page = 0;
    this.reactiveForm.patchValue({user: ''});
    this.loadUsers();
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
    this.session.questionSet = {name: ''};
    this.querySets.search = '';
    this.querySets.page = 0;
    this.loadSets();
  }

  changeSet(set: ISet) {
    this.session.questionSet = set;
    this.reactiveForm.patchValue({
      set: set.name,
    });
    this.reactiveForm.markAsDirty();
  }

  /* Session */

  save() {
    this.isSubmitting = true;

    this.session = {
      ...this.session,
      finishedDate: this.finishedDate.value,
      quizAnswers: this.quizAnswers,
      userAnswers: this.userAnswers
    };

    if (this.creating) {
      this.sessionsService.create(this.session)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: ISession) => {
              this.updateCachedValues(res);
              this.creating = false;
              this.reactiveForm.markAsPristine();
              this.location.replaceState(`/admin/sessions/${res.id}`);
              this.toastrService.success(`Session created!`);
            },
            error: e => {
              console.log(e);
            },
          });
    } else {
      this.sessionsService.update(this.session)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: ISession) => {
              this.updateCachedValues(res);
              this.reactiveForm.markAsPristine();
              this.toastrService.info(`Session id ${res.id} updated!`);
            },
            error: e => {
              console.log(e);
            },
          });
    }
  }

  editQuizAnswer(value: any) {
    this.router.navigateByUrl(`/admin/quizzes/${value.quiz.id}`).then();
  }

  editUserAnswer(value: any) {
    this.router.navigateByUrl(`/admin/questions/${value.question.id}`).then();
  }

  deleteQuizAnswer(value: any) {
    this.quizAnswers = this.quizAnswers.filter(a => value.id !== a.id);
    this.quizAnswersSelected = [];
    this.reactiveForm.markAsDirty();
  }

  deleteUserAnswer(value: any) {
    this.userAnswers = this.userAnswers.filter(a => value.id !== a.id);
    this.userAnswersSelected = [];
    this.reactiveForm.markAsDirty();
  }

  deleteQuizAnswers() {
    this.quizAnswers = this.quizAnswers.filter(a => this.quizAnswersSelected.indexOf(a) === -1);
    this.reactiveForm.markAsDirty();
    this.quizAnswersSelected = [];
  }

  deleteUserAnswers() {
    this.userAnswers = this.userAnswers.filter(a => this.userAnswersSelected.indexOf(a) === -1);
    this.reactiveForm.markAsDirty();
    this.userAnswersSelected = [];
  }

  changeQuizAnswersSelectedRows(rows: any) {
    this.quizAnswersSelected = rows;
  }

  changeUserAnswersSelectedRows(rows: any) {
    this.userAnswersSelected = rows;
  }

  private shortener(value: string): string {
    const size = 30;
    return value.substring(0, size) + (value.length > size ? '..' : '')
  }

  changeCellInputVisibility(index: string, col: any) {
    this.tableCell.editFinished = !this.tableCell.editFinished;
    if (this.tableCell.editFinished) {
      this.tableCell.visibleRow = index;
      this.tableCell.visibleColumn = col.field;
      this.tableCell.editFinished = false;
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
}
