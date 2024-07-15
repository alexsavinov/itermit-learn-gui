import { IPageable } from "@shared/interfaces/pageable.interface";

export interface ISource {
  id?: number | string | null;
  name: string;
  url?: string;
}

export interface IPageableSource extends IPageable {
  _embedded?: {
    sources: ISource[];
  };
}
