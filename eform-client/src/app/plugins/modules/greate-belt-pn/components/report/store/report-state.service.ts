import { Injectable } from '@angular/core';
import { ReportCaseModel } from '../../../models';
import { ReportStore, ReportQuery } from './';
import { Observable } from 'rxjs';
import {
  OperationDataResult,
  Paged,
  PaginationModel,
  SortModel,
} from 'src/app/common/models';
import { updateTableSort } from 'src/app/common/helpers';
import { getOffset } from 'src/app/common/helpers/pagination.helper';
import { map } from 'rxjs/operators';
import { GreateBeltPnReportService } from '../../../services';

@Injectable({ providedIn: 'root' })
export class ReportStateService {
  constructor(
    private store: ReportStore,
    private service: GreateBeltPnReportService,
    private query: ReportQuery
  ) {}

  // getOffset(): Observable<number> {
  //   return this.query.selectOffset$;
  // }

  getActiveSort(): Observable<string> {
    return this.query.selectActiveSort$;
  }

  getActiveSortDirection(): Observable<'asc' | 'desc'> {
    return this.query.selectActiveSortDirection$;
  }

  getNameFilter(): Observable<string> {
    return this.query.selectNameFilter$;
  }

  getReport(
    eformIds: number[]
  ): Observable<OperationDataResult<Paged<ReportCaseModel>>> {
    return this.service
      .getReport({
        ...this.query.pageSetting.pagination,
        ...this.query.pageSetting.filters,
        eformIds,
      })
      .pipe(
        map((response) => {
          if (response && response.success && response.model) {
            this.store.update(() => ({
              totalReportCases: response.model.total,
            }));
          }
          return response;
        })
      );
  }

  updateNameFilter(nameFilter: string) {
    this.store.update((state) => ({
      filters: {
        ...state.filters,
        nameFilter: nameFilter,
      },
      pagination: {
        ...state.pagination,
        offset: 0,
      },
    }));
  }

  updatePageSize(pageSize: number) {
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        pageSize: pageSize,
      },
    }));
    this.checkOffset();
  }

  changePage(offset: number) {
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        offset: offset,
      },
    }));
  }

  onDelete() {
    this.store.update((state) => ({
      totalReportCases: state.totalReportCases - 1,
    }));
    this.checkOffset();
  }

  onSortTable(sort: string) {
    const localPageSettings = updateTableSort(
      sort,
      this.query.pageSetting.pagination.sort,
      this.query.pageSetting.pagination.isSortDsc
    );
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        isSortDsc: localPageSettings.isSortDsc,
        sort: localPageSettings.sort,
      },
    }));
  }

  checkOffset() {
    const newOffset = getOffset(
      this.query.pageSetting.pagination.pageSize,
      this.query.pageSetting.pagination.offset,
      this.query.pageSetting.totalReportCases
    );
    if (newOffset !== this.query.pageSetting.pagination.offset) {
      this.store.update((state) => ({
        pagination: {
          ...state.pagination,
          offset: newOffset,
        },
      }));
    }
  }

  getPagination(): Observable<PaginationModel> {
    return this.query.selectPagination$;
  }

  updatePagination(pagination: PaginationModel) {
    this.store.update((state) => ({
      pagination: {
        ...state.pagination,
        pageSize: pagination.pageSize,
        offset: pagination.offset,
      },
    }));
    // this.checkOffset();
  }
}
