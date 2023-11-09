import { Injectable } from '@angular/core';
import { ReportCaseModel } from '../../../models';
//import { ReportStore, ReportQuery } from './';
import { Observable } from 'rxjs';
import {
  CommonPaginationState, FiltrationStateModel,
  OperationDataResult,
  Paged,
  PaginationModel,
  SortModel,
} from 'src/app/common/models';
import { updateTableSort } from 'src/app/common/helpers';
import { getOffset } from 'src/app/common/helpers/pagination.helper';
import { map } from 'rxjs/operators';
import { GreateBeltPnReportService } from '../../../services';
import {Store} from '@ngrx/store';
import {selectReportFilters, selectReportPagination} from '../../../state/report/report.selector';

@Injectable({ providedIn: 'root' })
export class ReportStateService {
  private selectReportPagination$ = this.store.select(selectReportPagination);
  private selectReportFilters$ = this.store.select(selectReportFilters);
  constructor(
    //private store: ReportStore,
    private store: Store,
    private service: GreateBeltPnReportService,
    //private query: ReportQuery
  ) {}

  // getOffset(): Observable<number> {
  //   return this.query.selectOffset$;
  // }
  //
  // getActiveSort(): Observable<string> {
  //   return this.query.selectActiveSort$;
  // }
  //
  // getActiveSortDirection(): Observable<'asc' | 'desc'> {
  //   return this.query.selectActiveSortDirection$;
  // }
  //
  // getNameFilter(): Observable<string> {
  //   return this.query.selectNameFilter$;
  // }

  getReport(
    eformIds: number[]
  ): Observable<OperationDataResult<Paged<ReportCaseModel>>> {
    let currentPagination: CommonPaginationState;
    this.selectReportPagination$.subscribe((x) => currentPagination = x);
    let currentFilters: FiltrationStateModel;
    this.selectReportFilters$.subscribe((x) => currentFilters = x);
    return this.service
      .getReport({
        ...currentPagination,
        ...currentFilters,
        eformIds,
      })
      .pipe(
        map((response) => {
          if (response && response.success && response.model) {
            // this.store.update(() => ({
            //   totalReportCases: response.model.total,
            // }));
            this.store.dispatch({
              type: '[Report] Update report pagination',
              payload: {
                ...currentPagination,
                total: response.model.total,
              }
            })
          }
          return response;
        })
      );
    // return this.service
    //   .getReport({
    //     ...this.query.pageSetting.pagination,
    //     ...this.query.pageSetting.filters,
    //     eformIds,
    //   })
    //   .pipe(
    //     map((response) => {
    //       if (response && response.success && response.model) {
    //         this.store.update(() => ({
    //           totalReportCases: response.model.total,
    //         }));
    //       }
    //       return response;
    //     })
    //   );
  }

  updateNameFilter(nameFilter: string) {
    let currentFilters: FiltrationStateModel;
    this.selectReportFilters$.subscribe((x) => currentFilters = x);
    this.store.dispatch({
      type: '[Report] Update report filters',
      payload: {
        ...currentFilters,
        nameFilter,
      }
    })
    // this.store.update((state) => ({
    //   filters: {
    //     ...state.filters,
    //     nameFilter: nameFilter,
    //   },
    //   pagination: {
    //     ...state.pagination,
    //     offset: 0,
    //   },
    // }));
  }
  //
  // updatePageSize(pageSize: number) {
  //   this.store.update((state) => ({
  //     pagination: {
  //       ...state.pagination,
  //       pageSize: pageSize,
  //     },
  //   }));
  //   this.checkOffset();
  // }
  //
  // changePage(offset: number) {
  //   this.store.update((state) => ({
  //     pagination: {
  //       ...state.pagination,
  //       offset: offset,
  //     },
  //   }));
  // }

  onSortTable(sort: string) {
    let currentPagination: CommonPaginationState;
    this.selectReportPagination$.subscribe((x) => currentPagination = x);
    const localPageSettings = updateTableSort(
      sort,
      currentPagination.sort,
      currentPagination.isSortDsc
    );
    this.store.dispatch({
      type: '[Report] Update report pagination',
      payload: {
        ...currentPagination,
        isSortDsc: localPageSettings.isSortDsc,
        sort: localPageSettings.sort,
      }
    })
    // const localPageSettings = updateTableSort(
    //   sort,
    //   this.query.pageSetting.pagination.sort,
    //   this.query.pageSetting.pagination.isSortDsc
    // );
    // this.store.update((state) => ({
    //   pagination: {
    //     ...state.pagination,
    //     isSortDsc: localPageSettings.isSortDsc,
    //     sort: localPageSettings.sort,
    //   },
    // }));
  }
  //
  // checkOffset() {
  //   const newOffset = getOffset(
  //     this.query.pageSetting.pagination.pageSize,
  //     this.query.pageSetting.pagination.offset,
  //     this.query.pageSetting.totalReportCases
  //   );
  //   if (newOffset !== this.query.pageSetting.pagination.offset) {
  //     this.store.update((state) => ({
  //       pagination: {
  //         ...state.pagination,
  //         offset: newOffset,
  //       },
  //     }));
  //   }
  // }
  //
  // getPagination(): Observable<PaginationModel> {
  //   return this.query.selectPagination$;
  // }

  updatePagination(pagination: PaginationModel) {
    let currentPagination: CommonPaginationState;
    this.selectReportPagination$.subscribe((x) => currentPagination = x);
    this.store.dispatch({
      type: '[Report] Update report pagination',
      payload: {
        ...currentPagination,
        pageSize: pagination.pageSize,
        offset: pagination.offset,
      }
    })
    // this.store.update((state) => ({
    //   pagination: {
    //     ...state.pagination,
    //     pageSize: pagination.pageSize,
    //     offset: pagination.offset,
    //   },
    // }));
    // this.checkOffset();
  }
}
