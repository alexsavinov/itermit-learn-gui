import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Location } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { finalize } from "rxjs/operators";

import { ISource } from "../../interfaces";
import { SourceService } from "../../services";


@Component({
  selector: 'app-source',
  templateUrl: './source.component.html',
  styleUrl: './source.component.scss'
})
export class SourceComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    url: ['', [Validators.required]],
  });

  @Input()
  creating!: boolean;
  isLoading = true;
  isSubmitting = false;

  source = {} as ISource;

  get name() {
    return this.reactiveForm.get('name')!;
  }

  get url() {
    return this.reactiveForm.get('url')!;
  }

  constructor(
      private fb: FormBuilder,
      private activatedRoute: ActivatedRoute,
      public dialog: MatDialog,
      private location: Location,
      private router: Router,
      private translate: TranslateService,
      private sourceService: SourceService,
      private toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({creating}) => this.creating = creating);

    this.isLoading = true;
    if (!this.creating) {
      this.activatedRoute.params.subscribe(({id}) =>
          this.sourceService.getById(id)
              .pipe(finalize(() => this.isLoading = false))
              .subscribe(res => {
                this.updateCachedValues(res);
              })
      );
    }
  }

  private updateCachedValues(data: ISource) {
    this.source = data;

    this.reactiveForm.patchValue({
      name: data.name,
      url: data.url
    });
  }

  save() {
    this.isSubmitting = true;

    this.source = {
      ...this.source,
      name: this.name.value,
      url: this.url.value
    };

    if (this.creating) {
      this.sourceService.create(this.source)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: ISource) => {
              this.updateCachedValues(res);
              this.reactiveForm.markAsPristine();
              this.creating = false;
              this.location.replaceState(`/admin/sources/${res.id}`);
              this.toastrService.success(`Source created!`);
            },
            error: e => {
              console.log(e);
            },
          });
    } else {
      this.sourceService.update(this.source)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (res: ISource) => {
              this.updateCachedValues(res);
              this.reactiveForm.markAsPristine();
              this.toastrService.info(`Source id ${res.id} updated!`);
            },
            error: e => {
              console.log(e);
            },
          });
    }
  }

}
