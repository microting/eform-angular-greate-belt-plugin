import {CommonPaginationState, FiltrationStateModel} from 'src/app/common/models';
import {Action, createReducer, on} from '@ngrx/store';
import {
  updateReportFilters,
  updateReportPagination, updateReportsTotal
} from './report.actions';

export interface ReportState {
  pagination: CommonPaginationState;
  filters: FiltrationStateModel;
  totalReportCases: number;
}

export const initialReportState: ReportState = {
  pagination: {
    pageSize: 10,
    sort: 'Id',
    isSortDsc: true,
    offset: 0,
    total: 0,
    pageIndex: 0,
  },
  filters: {
    nameFilter: '',
    tagIds: [],
  },
  totalReportCases: 0,
};

export const _reducer = createReducer(
  initialReportState,
  on(updateReportFilters, (state, {payload}) => ({
      ...state,
      filters: {...state.filters, ...payload},
    }),
  ),
  on(updateReportPagination, (state, {payload}) => ({
      ...state,
      pagination: {...state.pagination, ...payload},
    }),
  ),
  on(updateReportsTotal, (state, {payload}) => ({
      ...state,
      pagination: {...state.pagination, total: payload},
      totalReportCases: payload,
    }),
  ),
);

export function reportReducer(state: ReportState | undefined, action: Action) {
  return _reducer(state, action);
}
