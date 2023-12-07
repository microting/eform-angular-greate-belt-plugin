import {createAction} from '@ngrx/store';

export const updateReportFilters = createAction(
  '[Report] Update report filters',
  (payload: any) => ({payload})
);


export const updateReportPagination = createAction(
  '[Report] Update report pagination',
  (payload: any) => ({payload})
);
