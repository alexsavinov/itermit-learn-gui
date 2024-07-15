import { Component, OnInit } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { debounceTime, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from "@angular/forms";

import { cleanJSON, dateFormat, User } from '@core';
import { SessionsService } from "../../services/sessions.service";
import { ISet } from "../../../sets/interfaces";
import { UsersService } from "../../../users/services";
import { SetsService } from "../../../sets/services";


@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss'
})
export class SessionsComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    search: [''],
    user: [''],
    set: [''],
    finished: ['']
  });

  columns: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true},
    {header: 'user', field: 'user.username', sortable: true},
    {header: 'set', field: 'questionSet.name', sortable: true},
    {header: 'quiz answers', field: 'quizAnswers.length', type: 'number', sortable: true},
    {header: 'user answers', field: 'userAnswers.length', type: 'number', sortable: true},
    {
      header: 'finished', field: 'finishedDate', type: 'date', sortable: true,
      formatter: (data: any) => dateFormat(data.finishedDate)
    },
    {
      header: 'created', field: 'createdDate', type: 'date', sortable: true,
      formatter: (data: any) => dateFormat(data.createdDate)
    },
    {
      header: 'updated', field: 'lastUpdateDate', type: 'date', sortable: true,
      formatter: (data: any) => dateFormat(data.lastUpdateDate)
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
    setId: '',
    finished: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  subject: Subject<any> = new Subject();

  users: User[] = [];
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

  finished: '' | 'true' | 'false' = '';

  get params() {
    return Object.assign({}, this.query);
  }

  get paramsUsers() {
    return Object.assign({}, this.queryUsers);
  }

  get paramsSets() {
    return Object.assign({}, this.querySets);
  }

  get search() {
    return this.reactiveForm.get('search')!;
  }

  get user() {
    return this.reactiveForm.get('user')!;
  }

  get set() {
    return this.reactiveForm.get('set')!;
  }

  constructor(
      private fb: FormBuilder,
      private sessionsService: SessionsService,
      private usersService: UsersService,
      private setsService: SetsService,
      private translate: TranslateService,
      private router: Router,
      public activatedRoute: ActivatedRoute,
      private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.subject.pipe(debounceTime(1000)).subscribe(() => this.getList());
    this.getList();

    this.loadUsers();
    this.loadSets();
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

  /* SETS */

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

  changeSet(set: any) {
    this.query.setId = String((set) ? set.id : '');
    this.getList();
  }

  resetSet() {
    this.query.setId = '';
    this.querySets.search = '';
    this.querySets.page = 0;
    this.reactiveForm.patchValue({set: ''});
    this.loadSets();
  }

  /* FINISHED */

  changeFinished() {
    if (this.finished === 'true') {
      this.finished = 'false';
    } else if (this.finished === 'false') {
      this.finished = '';
    } else {
      this.finished = 'true';
    }

    this.query.finished = this.finished;
    this.getList();
  }

  private resetFinished() {
    this.finished = '';
    this.query.finished = '';
  }

  /* MAIN LIST */

  getList() {
    this.isLoading = true;

    this.sessionsService
        .getAll(cleanJSON(this.params))
        .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
        )
        .subscribe(res => {
          this.list = res._embedded?.sessions || [];
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

    this.resetUser();
    this.resetSet();
    this.resetFinished();

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
    this.sessionsService.deleteById(value.id).subscribe(() => {
      this.getList();
      this.toastrService.warning(`You have deleted session with id ${value.id}!`);
    });
  }

}