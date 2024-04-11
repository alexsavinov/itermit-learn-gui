import { Component, OnInit } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { debounceTime, finalize } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { cleanJSON, dateFormat } from '@core';
import { environment } from '@env/environment';
import { NewsService } from '../../services';


@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
})
export class NewsComponent implements OnInit {
  columns: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true},
    {
      header: 'logo',
      field: 'logo',
      type: 'image',
      width: '50px',
      formatter: (data: any) => data.logo
        ? `<img src="${environment.staticUrl + environment.newsImages + data.logo}" width=35 alt="">`
        : '',
    },
    {header: 'title', field: 'title', sortable: true},
    {header: 'visible', field: 'visible', type: 'boolean', sortable: true},
    {header: 'author', field: 'author.username'},
    {
      header: 'published', field: 'publishDate', type: 'date', sortable: true,
      formatter: (data: any) => dateFormat(data.publishDate)
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
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  subject: Subject<any> = new Subject();

  get params() {
    return Object.assign({}, this.query);
  }

  constructor(
    private newsService: NewsService,
    private translate: TranslateService,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.subject.pipe(debounceTime(1000)).subscribe(() => this.getList());
    this.getList();
  }

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
    this.router.navigate([value.id], {relativeTo: this.activatedRoute});
  }

  delete(value: any) {
    this.newsService.deleteById(value.id).subscribe(() => {
      this.getList();
      this.toastrService.warning(`You have deleted article with id ${value.id}!`);
    });
  }
}
