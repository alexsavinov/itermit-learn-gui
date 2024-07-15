import { Component, OnInit } from '@angular/core';
import { FormBuilder } from "@angular/forms";
import { MtxGridColumn } from "@ng-matero/extensions/grid";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { debounceTime, finalize } from "rxjs/operators";
import { PageEvent } from "@angular/material/paginator";

import { AuthService, cleanJSON, dateFormat } from "@core";
import { ISet } from "../../../sets/interfaces";
import { SetsService } from "../../../sets/services";
import { SessionsService } from "../../services/sessions.service";


@Component({
  selector: 'app-user-sessions',
  templateUrl: './user-sessions.component.html',
  styleUrl: './user-sessions.component.scss'
})
export class UserSessionsComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    search: [''],
    set: ['']
  });

  columns: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true},
    // {header: 'user', field: 'user.username', sortable: true},
    {
      header: 'created', field: 'createdDate', type: 'date', sortable: true,
      formatter: (data: any) => dateFormat(data.createdDate)
    },
    {
      header: 'finished', field: 'finishedDate', type: 'date', sortable: true,
      formatter: (data: any) => dateFormat(data.finishedDate)
    },
    {header: 'quiz answers', field: 'quizAnswers.length', type: 'number', sortable: true},
    {header: 'user answers', field: 'userAnswers.length', type: 'number', sortable: true},
    // {
    //   header: 'updated', field: 'lastUpdateDate', type: 'date', sortable: true,
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
          icon: 'start',
          tooltip: this.translate.stream('dialog.resume'),
          click: record => this.continue(record),
          disabled: rowData => rowData.finishedDate,
        },
        {
          type: 'icon',
          icon: 'summarize',
          tooltip: this.translate.stream('dialog.summary'),
          click: record => this.summary(record),
          disabled: rowData => !rowData.finishedDate
        },
        // {
        //   type: 'icon',
        //   color: 'warn',
        //   icon: 'delete',
        //   tooltip: this.translate.stream('dialog.delete'),
        //   pop: {
        //     title: this.translate.stream('dialog.confirm_delete'),
        //     closeText: this.translate.stream('dialog.close'),
        //     okText: this.translate.stream('dialog.ok'),
        //   },
        //   click: record => this.delete(record),
        // },
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

  sets: ISet[] = [];
  totalPagesSets = 0;
  querySets = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 10,
  };

  subject: Subject<any> = new Subject();

  finished: '' | 'true' | 'false' = '';

  get params() {
    return Object.assign({}, this.query);
  }

  get paramsSets() {
    return Object.assign({}, this.querySets);
  }

  get search() {
    return this.reactiveForm.get('search')!;
  }

  get set() {
    return this.reactiveForm.get('set')!;
  }

  constructor(
      private fb: FormBuilder,
      private sessionsService: SessionsService,
      private setsService: SetsService,
      private auth: AuthService,
      private translate: TranslateService,
      private router: Router,
      public activatedRoute: ActivatedRoute,
      private toastrService: ToastrService) {
  }

  ngOnInit() {
    this.subject.pipe(debounceTime(1000)).subscribe(() => this.getList());

    this.auth.user().subscribe(user => {
      this.query.userId = String(user.id);
      this.getList();
      this.loadSets();
    });
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
    this.query.page = 0;
    this.query.size = 10;
    this.query.search = '';
    this.query.sort = '';
    this.getList();
  }

  onKeyUp() {
    this.query.search = this.search.value;
    this.subject.next(undefined);
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

  private summary(value: any) {
    this.router.navigate([value.id, "summary"], {relativeTo: this.activatedRoute}).then();
  }

  private continue(value: any) {
    this.router.navigate([value.id], {relativeTo: this.activatedRoute}).then();
  }
}
