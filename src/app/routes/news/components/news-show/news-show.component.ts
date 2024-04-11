import { Component, OnInit, Sanitizer, SecurityContext } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { addAPIUrl } from '@shared/utils/helpers';
import { environment } from '@env/environment';
import { IArticle } from '../../interfaces';
import { NewsService } from '../../services';


@Component({
  selector: 'app-news-show',
  templateUrl: './news-show.component.html',
  styleUrls: ['./news-show.component.scss'],
})
export class NewsShowComponent implements OnInit {
  article!: IArticle;
  content!: SafeHtml;

  constructor(
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private newsService: NewsService) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(({ id }) => {
        this.newsService.getById(id).subscribe(article => {
          this.article = addAPIUrl(article);

          this.content = this.sanitizer.bypassSecurityTrustHtml(
            this.article.content?.replaceAll(
              'pre class="language-java"',
              'pre class="prettyprint linenums lang-java w-80"',
            ) || '');

          const body = <HTMLDivElement>document.body;
          const script = document.createElement('script');
          script.innerHTML = '';
          // desert doxy sons-of-obsidian sunburst
          script.src = 'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js?lang=java&skin=sons-of-obsidian';
          script.async = true;
          script.defer = true;
          body.appendChild(script);
        });
      },
    );
  }

  protected readonly environment = environment;
}
