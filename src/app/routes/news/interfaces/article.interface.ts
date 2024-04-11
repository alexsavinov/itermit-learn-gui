import { User } from '@core';

export interface IArticle {
  id?: number | string | null;
  title: string;
  logo?: string;
  description?: string;
  content?: string;
  visible?: boolean;
  author?: User;
  publishDate?: string;
  createdDate?: string;
  lastUpdateDate?: string;
}

export interface IPageableArticle {
  _embedded?: {
    articles: IArticle[];
  };
  items: any[];
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  };
}
