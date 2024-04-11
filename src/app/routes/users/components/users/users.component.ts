import { Component, OnInit } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { debounceTime, finalize } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { environment } from '@env/environment';
import { cleanJSON, dateFormat } from '@core';
import { UsersService } from '../../services';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  columns: MtxGridColumn[] = [
    { header: 'id', field: 'id', type: 'number', width: '80px', sortable: true },
    {
      header: 'avatar',
      field: 'profile.avatar',
      type: 'image',
      width: '50px',
      formatter: (data: any) => data.profile.avatar
        ? `<img src="${ environment.staticUrl + environment.avatarImages + data.profile.avatar }" width=35 alt="">`
        : '',
    },
    { header: 'username', field: 'username', sortable: true },
    { header: 'name', field: 'profile.name', sortable: true },
    { header: 'roles', field: 'roles' },
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
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  subject: Subject<any> = new Subject();

  get params() {
    return Object.assign({}, this.query);
  }

  constructor(
    private translate: TranslateService,
    private usersService: UsersService,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    public toastrService: ToastrService) {
  }

  ngOnInit() {
    this.subject.pipe(debounceTime(1000)).subscribe(() => this.getList());
    this.getList();
  }

  getList() {
    this.isLoading = true;

    this.usersService
      .getAll(cleanJSON(this.params))
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
      )
      .subscribe(res => {
        // console.log(res._embedded?.users);
        this.list = res._embedded?.users || [];
        this.total = res.page.totalElements;
        // this.isLoading = false;
      });
  }

  getNextPage(e: PageEvent) {
    this.query.page = e.pageIndex;
    this.query.size = e.pageSize;
    this.getList();
  }

  search() {
    this.query.page = 0;
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
    this.getList();
  }

  onKeyUp() {
    this.subject.next(undefined);
  }

  edit(value: any) {
    this.router.navigate([value.id], { relativeTo: this.activatedRoute });
  }

  delete(value: any) {
    this.usersService.deleteById(value.id).subscribe(() => {
      this.getList();
      this.toastrService.warning(`You have deleted user with id ${ value.id }!`);
    });
  }
}
