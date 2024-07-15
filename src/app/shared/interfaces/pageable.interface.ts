export interface IPageable {
  items: any[];
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
  };
}
