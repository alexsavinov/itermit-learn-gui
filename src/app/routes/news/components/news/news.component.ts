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
import { NewsService } from '../../services';
import { UsersService } from "../../../users/services";


@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    search: [''],
    user: ['']
  });

  columns: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true},
    {
      header: 'visible', field: 'visible', type: 'boolean',
      sortable: true, width: '60px'
    },
    {
      header: 'published', field: 'publishDate', type: 'date', sortable: true, width: '150px',
      formatter: (data: any) => dateFormat(data.publishDate)
    },
    {header: 'author', field: 'author.username'},
    {
      header: 'title', field: 'title', sortable: true,
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
    visible: '',
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

  visible: '' | 'true' | 'false' = '';

  get params() {
    return Object.assign({}, this.query);
  }

  get paramsUsers() {
    return Object.assign({}, this.queryUsers);
  }

  get search() {
    return this.reactiveForm.get('search')!;
  }

  get user() {
    return this.reactiveForm.get('user')!;
  }

  constructor(
      private fb: FormBuilder,
      private newsService: NewsService,
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

    this.newsService
        .getAll(cleanJSON(this.params))
        .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
        )
        .subscribe(res => {
          this.list = res._embedded?.articles || [];
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
    this.resetVisible();

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
    this.newsService.deleteById(value.id).subscribe(() => {
      this.getList();
      this.toastrService.warning(`You have deleted article with id ${value.id}!`);
    });
  }

  private shortener(value: string): string {
    const size = 30;
    return value.substring(0, size) + (value.length > size ? '..' : '')
  }

  changeVisible() {
    if (this.visible === 'true') {
      this.visible = 'false';
    } else if (this.visible === 'false') {
      this.visible = '';
    } else {
      this.visible = 'true';
    }

    this.query.visible = this.visible;
    this.getList();
  }

  private resetVisible() {
    this.visible = '';
    this.query.visible = '';
  }
}
