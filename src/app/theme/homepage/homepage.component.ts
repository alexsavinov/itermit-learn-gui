import { Component, OnInit } from '@angular/core';

import { cleanJSON } from '@core';
import { IArticle } from '../../routes/news/interfaces';
import { NewsService } from '../../routes/news/services';
import { environment } from '@env/environment';


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  news: IArticle[] = [];

  query = {
    sort: 'publishDate,desc',
    page: 0,
    size: 2,
  };

  get params() {
    return Object.assign({}, this.query);
  }

  constructor(private newsService: NewsService) {
  }

  ngOnInit() {
    this.getNews();
  }

  getNews() {
    this.newsService
      .getAll(cleanJSON(this.params))
      .subscribe(res => {
        this.news.push(...res._embedded?.articles || []);
      });
  }

  protected readonly environment = environment;

  showMore() {
    this.query.page++;
    this.getNews();
  }
}
