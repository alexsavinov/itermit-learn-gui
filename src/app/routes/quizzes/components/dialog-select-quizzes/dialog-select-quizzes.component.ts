import { Component, Inject, OnInit } from '@angular/core';
import { MtxGridColumn } from "@ng-matero/extensions/grid";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { debounceTime, finalize } from "rxjs/operators";
import { PageEvent } from "@angular/material/paginator";

import { cleanJSON, dateFormat } from "@core";
import { QuizService } from "../../services";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";


@Component({
  selector: 'app-dialog-select-quizzes',
  templateUrl: './dialog-select-quizzes.component.html',
  styleUrls: ['./dialog-select-quizzes.component.scss']
})
export class DialogSelectQuizzesComponent implements OnInit {
  columns: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true},
    {
      header: 'title',
      field: 'title',
      sortable: true,
      formatter: (data: any) => this.shortener(data.title)
    },
    {header: 'answers', field: 'quizAnswers.length', type: 'number', sortable: true},
    {
      header: 'created',
      field: 'createdDate',
      type: 'date',
      sortable: true,
      formatter: (data: any) => dateFormat(data.createdDate)
    },
    {
      header: 'updated',
      field: 'lastUpdateDate',
      type: 'date', sortable: true,
      formatter: (data: any) => dateFormat(data.lastUpdateDate)
    }
  ];

  list: any[] = [];
  selected: any[] = [];
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
      private quizService: QuizService,
      private translate: TranslateService,
      private router: Router,
      public activatedRoute: ActivatedRoute,
      private toastrService: ToastrService,
      public dialogRef: MatDialogRef<DialogSelectQuizzesComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  onSubmit(): void {
    this.dialogRef.close(this.selected);
  }

  ngOnInit() {
    this.subject.pipe(debounceTime(1000)).subscribe(() => this.getList());
    this.getList();
  }

  getList() {
    this.isLoading = true;

    this.quizService
        .getAll(cleanJSON(this.params))
        .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
        )
        .subscribe(res => {
          this.list = res._embedded?.quizzes || [];
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

  private shortener(value: string): string {
    const size = 30;
    return value.substring(0, size) + (value.length > size ? '..' : '')
  }

  changeSelectedRows(rows: any[]) {
    this.selected = rows;
  }
}
