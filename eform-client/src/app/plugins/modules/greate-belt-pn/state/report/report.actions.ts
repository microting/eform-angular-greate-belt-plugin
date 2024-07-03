import {createAction} from '@ngrx/store';
import {CommonPaginationState, FiltrationStateModel} from 'src/app/common/models';

export const updateReportFilters = createAction(
  '[Report] Update report filters',
  (payload: FiltrationStateModel) => ({payload})
);

export const updateReportPagination = createAction(
  '[Report] Update report pagination',
  (payload: CommonPaginationState) => ({payload})
);

export const updateReportsTotal = createAction(
  '[Report] Update report total',
  (payload: number) => ({payload})
);
