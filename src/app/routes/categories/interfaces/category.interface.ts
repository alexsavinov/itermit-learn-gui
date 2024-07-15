import { IPageable } from "@shared";

export interface ICategory {
  id?: number | string | null;
  name: string;
}

export interface IPageableCategory extends IPageable {
  _embedded?: {
    categories: ICategory[];
  };
}
