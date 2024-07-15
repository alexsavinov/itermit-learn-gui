import { Component, Input, OnInit } from '@angular/core';
import { EditorComponent } from '@tinymce/tinymce-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TinyMCE } from 'tinymce';
import { ToastrService } from 'ngx-toastr';
import { Location } from '@angular/common';

import { environment } from '@env/environment';
import { addAPIUrl, removeAPIUrl } from '@shared/utils/helpers';
import { AuthService, cleanJSON, SettingsService, User } from '@core';
import { IArticle } from '../../interfaces';
import { NewsService } from '../../services';
import { UsersService } from "../../../users/services";
import { finalize } from "rxjs/operators";


@Component({
  selector: 'app-news-details',
  templateUrl: './news-details.component.html',
  styleUrls: ['./news-details.component.scss'],
})
export class NewsDetailsComponent implements OnInit {
  reactiveForm = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    logo: [''],
    description: [''],
    content: [''],
    visible: [false],
    author: [''],
    publishDate: [''],
  });

  protected readonly environment = environment;

  config: EditorComponent['init'] = {
    selector: 'content_ifr',
    skin: 'oxide-dark',
    content_css: 'dark',
    branding: false,
    referrer_policy: 'origin',
    extended_valid_elements: 'img[class|src|alt|title|width|loading=lazy]',
    plugins: 'preview importcss searchreplace autolink autosave ' +
        'save directionality code visualblocks visualchars fullscreen image link ' +
        'media codesample table charmap pagebreak nonbreaking anchor ' +
        'insertdatetime advlist lists wordcount ' +
        'help charmap quickbars emoticons',
    toolbar:
        'undo redo | save | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image codesample',
    codesample_global_prismjs: true,
    codesample_languages: [
      {text: 'HTML/XML', value: 'markup'},
      {text: 'JavaScript', value: 'javascript'},
      {text: 'CSS', value: 'css'},
      {text: 'PHP', value: 'php'},
      {text: 'Ruby', value: 'ruby'},
      {text: 'Python', value: 'python'},
      {text: 'Java', value: 'java'},
      {text: 'C', value: 'c'},
      {text: 'C#', value: 'csharp'},
      {text: 'C++', value: 'cpp'},
    ],
    file_picker_types: 'image',
    image_advtab: false,
    image_description: false,
    image_dimensions: false,
    block_unsupported_drop: true,
    images_upload_credentials: true,
    theme_advanced_buttons3_add: 'save',
    save_enablewhendirty: true,
    save_onsavecallback: () => {
    },
    paste_data_images: true,
    height: 'calc(60vh - 88px)',
    images_upload_handler: (blobInfo, progress) => new Promise((resolve, reject) => {
      this.newsService.saveImage(blobInfo.blob()).subscribe((data) => {
            resolve(environment.staticUrl + environment.newsImages + data.location);
          },
      );
    }),

    setup: (editor: any) => {
      this.editor = editor;
      editor.on('keyup change', () => {
      });
    },
  };

  editor!: TinyMCE;
  apiKey: any;
  logoFile!: any;
  logoRawFile: any;

  @Input()
  article: IArticle = {title: '', content: ''};
  isSubmitting = false;
  creating!: boolean;

  users: User[] = [];
  totalPagesUsers = 0;
  queryUsers = {
    search: '',
    sort: 'id,asc',
    page: 0,
    size: 5,
  };

  get paramsUsers() {
    return Object.assign({}, this.queryUsers);
  }

  get title() {
    return this.reactiveForm.get('title')!;
  }

  get description() {
    return this.reactiveForm.get('description')!;
  }

  get logo() {
    return this.reactiveForm.get('logo')!;
  }

  get content() {
    return this.reactiveForm.get('content')!;
  }

  get visible() {
    return this.reactiveForm.get('visible')!;
  }

  get author() {
    return this.reactiveForm.get('author')!;
  }

  get publishDate() {
    return this.reactiveForm.get('publishDate')!;
  }

  constructor(
      private fb: FormBuilder,
      private settings: SettingsService,
      private auth: AuthService,
      private newsService: NewsService,
      private usersService: UsersService,
      private activatedRoute: ActivatedRoute,
      public dialog: MatDialog,
      private location: Location,
      private toastrService: ToastrService) {
  }

  ngOnInit(): void {
    this.apiKey = environment.tinymceApiKey;
    this.activatedRoute.data.subscribe(({creating}) => this.creating = creating);

    if (this.creating) {
      this.auth.user().subscribe(user => {
        this.article.author = user;
        this.article.publishDate = new Date(Date.now()).toISOString();

        this.reactiveForm.patchValue({
          author: this.article.author?.username,
          publishDate: this.article.publishDate,
        });
      });
    } else {
      this.activatedRoute.params.subscribe(({id}) =>
          this.newsService.getById(id).subscribe(article => {
            this.article = addAPIUrl(article);
            this.reactiveForm.patchValue({
              title: this.article.title,
              logo: this.article.logo,
              description: this.article.description,
              content: this.article.content,
              visible: this.article.visible,
              author: this.article.author?.username,
              publishDate: this.article.publishDate,
            });
          }),
      );
    }

    this.settings.notify.subscribe(({theme}) => {
          if (this.config) {
            if (theme === 'dark') {
              this.config.skin = 'oxide-dark';
              this.config.content_css = 'tinymce-5-dark';
            } else {
              this.config.skin = 'oxide';
              this.config.content_css = 'default';
            }
          }
        },
    );

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
  }

  moreUsers() {
    this.queryUsers.page = Math.min(this.totalPagesUsers, this.queryUsers.page + 1);
    this.loadUsers(true);
  }

  changeUser(user: User) {
    this.article.author = user;
  }

  resetUser() {
    this.article.author = {};
    this.queryUsers.search = '';
    this.queryUsers.page = 0;
    this.loadUsers();
  }

  /* ARTICLE */

  save() {
    this.isSubmitting = true;

    const articleUpdate: IArticle = {
      ...this.article,
      title: this.title.value,
      description: this.description.value,
      content: this.content.value,
      visible: this.visible.value,
      publishDate: this.publishDate.value,
    };

    if (this.logoRawFile) {
      this.newsService.saveImage(this.logoFile)
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe(data => {
                this.logoFile = undefined;
                this.logoRawFile = undefined;
                articleUpdate.logo = data.location;
                this.saveArticle(articleUpdate);
              },
          );
    } else {
      this.saveArticle(articleUpdate);
    }
  }

  private saveArticle(articleUpdate: IArticle) {
    this.isSubmitting = true;

    if (this.creating) {
      this.newsService.create(removeAPIUrl(articleUpdate))
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (data: IArticle) => {
              this.article = addAPIUrl(data);
              this.reactiveForm.markAsPristine();
              this.creating = false;
              this.location.replaceState(`/admin/news/${data.id}`);
              this.toastrService.success(`Article created!`);
            },
            error: e => {
              console.log(e);
            },
          });
    } else {
      this.newsService.update(removeAPIUrl(articleUpdate))
          .pipe(finalize(() => this.isSubmitting = false))
          .subscribe({
            next: (data: IArticle) => {
              this.article = addAPIUrl(data);
              this.reactiveForm.markAsPristine();
              this.toastrService.info(`Article id ${data.id} updated!`);
            },
            error: e => {
              console.log(e);
            },
          });
    }
  }

  changeVisible() {
    this.article.visible = !this.article.visible;
  }

  /* LOGO */

  updateImage(e: any) {
    if (!e.target.files || !e.target.files.length) {
      return;
    }

    [this.logoFile] = e.target.files;
    this.logoRawFile = URL.createObjectURL(this.logoFile);
    this.logo.markAsDirty();
    this.article.logo = '';
  }

  clearLogo() {
    if (this.article.logo || this.logoFile || this.logoRawFile) {
      this.article.logo = undefined;
      this.logoFile = undefined;
      this.logoRawFile = undefined;
      this.logo.markAsDirty();
    }
  }
}
