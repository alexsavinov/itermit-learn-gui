import { Component, OnInit } from '@angular/core';
import { MtxGridColumn } from "@ng-matero/extensions/grid";
import { cleanJSON } from "@core";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { debounceTime, finalize } from "rxjs/operators";
import { PageEvent } from "@angular/material/paginator";
import { SourceService } from "../../services";
import { FormBuilder } from "@angular/forms";


@Component({
  selector: 'app-sources',
  templateUrl: './sources.component.html',
  styleUrl: './sources.component.scss'
})
export class SourcesComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    search: ['']
  });

  columns: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true},
    {header: 'name', field: 'name', sortable: true},
    {header: 'url', field: 'url', sortable: true},
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

  get search() {
    return this.reactiveForm.get('search')!;
  }

  constructor(
      private fb: FormBuilder,
      private sourceService: SourceService,
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

    this.sourceService
        .getAll(cleanJSON(this.params))
        .pipe(
            finalize(() => {
              this.isLoading = false;
            }),
        )
        .subscribe(res => {
          this.list = res._embedded?.sources || [];
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
    this.sourceService.deleteById(value.id).subscribe(() => {
      this.getList();
      this.toastrService.warning(`You have deleted source with id ${value.id}!`);
    });
  }
}
