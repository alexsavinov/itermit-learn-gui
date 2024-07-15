export interface ITableCell {
  visibleRow: string;
  visibleColumn: string;
  editFinished: boolean;
  currentValue: string;
  cachedValue: string;
}

export function emptyITableCell(): ITableCell {
  return {
    visibleRow: '',
    visibleColumn: '',
    editFinished: true,
    currentValue: '',
    cachedValue: ''
  }
}