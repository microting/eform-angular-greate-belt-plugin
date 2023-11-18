import {GreateBeltState} from 'src/app/plugins/modules/greate-belt-pn/state/greate-belt.state';
import {createSelector} from '@ngrx/store';

export const selectGreateBeltPn = (state: { greateBeltPn: GreateBeltState }) => state.greateBeltPn;
export const selectReport =
  createSelector(selectGreateBeltPn, (state) => state.reportState);
export const selectReportPagination =
  createSelector(selectReport, (state) => state.pagination);
export const selectReportPaginationIsSortDsc =
  createSelector(selectReportPagination, (state) => state.isSortDsc ? 'desc' : 'asc');
export const selectReportPaginationSort =
  createSelector(selectReportPagination, (state) => state.sort);
export const selectReportFilters =
  createSelector(selectReport, (state) => state.filters);
export const selectReportFiltersNameFilter =
  createSelector(selectReportFilters, (state) => state.nameFilter);
