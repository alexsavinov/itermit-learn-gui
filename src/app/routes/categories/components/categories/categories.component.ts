import { Component, OnInit } from '@angular/core';
import { MtxGridColumn } from "@ng-matero/extensions/grid";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { debounceTime, finalize } from "rxjs/operators";
import { PageEvent } from "@angular/material/paginator";
import { MtxDialog } from "@ng-matero/extensions/dialog";
import { FormBuilder } from "@angular/forms";

import { cleanJSON } from "@core";
import { emptyITableCell } from "@shared";
import { DialogSaveComponent } from "@shared/components";
import { ICategory } from "../../interfaces";
import { CategoriesService } from "../../services";


@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    search: ['']
  });

  columns: MtxGridColumn[] = [
    {header: 'id', field: 'id', type: 'number', width: '80px', sortable: true},
    {header: 'name', field: 'name', sortable: true},
    {
      header: this.translate.stream('dialog.operation'),
      field: 'operation',
      minWidth: 70,
      width: '70px',
      pinned: 'right',
      type: 'button',
      buttons: [
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
  isSubmitting = false;

  categoriesSelected: any[] = [];
  cell = emptyITableCell();
  bs = new Subject<boolean>();

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
      private categoriesService: CategoriesService,
      private translate: TranslateService,
      private router: Router,
      public activatedRoute: ActivatedRoute,
      private toastrService: ToastrService,
      private dialog: MtxDialog) {
  }

  ngOnInit() {
    this.subject.pipe(debounceTime(1000)).subscribe(() => this.getList());

    this.getList();

    this.bs.subscribe(a => {
      if (this.cell.editFinished && this.cell.cachedValue !== '' && this.cell.cachedValue !== this.cell.currentValue) {
          const dialogRef = this.dialog.originalOpen(DialogSaveComponent, {width: '400px'});
          dialogRef.afterClosed().subscribe((result: string) => {
            if (result === 'true') {
              this.save(this.list[+this.cell.visibleRow])
              this.cell.visibleRow = '';
              this.cell.visibleColumn = '';
              this.cell.currentValue = '';
              this.cell.cachedValue = '';
            } else {
              this.list[+this.cell.visibleRow].name = this.cell.cachedValue;
              this.cell.editFinished = false;
            }
          });
        }
    });
  }

  getList() {
    this.isLoading = true;

    this.categoriesService
        .getAll(cleanJSON(this.params))
        .pipe(finalize(() => this.isLoading = false))
        .subscribe(res => {
          this.list = res._embedded?.categories || [];
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

  save(category: ICategory) {
    this.isSubmitting = true;

    if (category.id) {
      this.categoriesService.update(category)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: ICategory) => {
              this.getList();
              this.toastrService.info(`Category id ${res.id} updated!`);
            },
            error: e => {
              console.log(e);
            },
          });
    } else {
      this.categoriesService.create(category)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: ICategory) => {
              this.getList();
              this.toastrService.info(`Category '${res.name}' created!`);
            },
            error: e => {
              console.log(e);
            },
          });
    }

  }

  edit(value: any) {
    this.router.navigate([value.id], {relativeTo: this.activatedRoute});
  }

  delete(value: any) {
    this.categoriesService.deleteById(value.id).subscribe(() => {
      this.getList();
      this.toastrService.warning(`You have deleted category with id ${value.id}!`);
    });
  }

  changeTableSelectedRows(rows: any) {
    this.categoriesSelected = rows;
  }

  deleteCategories() {
    this.categoriesSelected.forEach(a => this.delete(a));
  }

  addCategory() {
    this.list = [...this.list, {name: ''}];
    this.changeCellInputVisibility((this.list.length - 1).toString(), {field: 'name'}, {});
    this.changeTableSelectedRows([]);
  }

  /* TABLE CELL */
  isCellEditable(index: string, col: any) {
    return parseInt(this.cell.visibleRow) === parseInt(index)
        && this.cell.visibleColumn === col.field
        && !col.disabled;
  }

  cellFinishEditing(row: any) {
    this.cell.visibleRow = '';
    this.cell.visibleColumn = '';
    this.cell.editFinished = true;

    if (!row.id || this.cell.cachedValue !== '' && this.cell.cachedValue !== row.name) {
      this.save(row);
    }
  }

  cellCancelEditing(row: any) {
    this.cell.visibleRow = '';
    this.cell.visibleColumn = '';
    this.cell.editFinished = true;

    if (this.cell.cachedValue !== '' && this.cell.cachedValue !== row.name) {
      row.name = this.cell.cachedValue;
    }
  }

  keyupCell(e: KeyboardEvent, row: any) {
    if (e.key === 'Enter') {
      this.cellFinishEditing(row);
    }
  }

  changeCell(row: any, col: any, value: any) {
    row[col.field] = value;
    this.cell.currentValue = value;
    this.cell.editFinished = true;
  }

  changeCellInputVisibility(index: string, col: any, row: any) {
    this.cell.currentValue = row[col.field];

    if (this.cell.visibleRow !== index && this.cell.visibleColumn !== col.field) {
      this.cell.editFinished = !this.cell.editFinished;
      if (this.cell.editFinished) {
        this.cell.visibleRow = '';
        this.cell.visibleColumn = '';
        this.cell.cachedValue = '';
      }
    }

    if (!this.cell.editFinished) {
      if (this.cell.visibleRow !== index || this.cell.visibleColumn !== col.field) {
        this.cell.cachedValue = row[col.field];
      }
      this.cell.visibleRow = index;
      this.cell.visibleColumn = col.field;
    }

    this.bs.next(this.cell.editFinished);
  }
}

