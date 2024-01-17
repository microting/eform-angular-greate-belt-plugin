import { Injectable } from '@angular/core';
import {tap} from 'rxjs';
import {
  CommonPaginationState,
  FiltrationStateModel,
  PaginationModel,
} from 'src/app/common/models';
import { updateTableSort } from 'src/app/common/helpers';
import { GreateBeltPnReportService } from '../../../services';
import {Store} from '@ngrx/store';
import {
  selectReportFilters,
  selectReportPagination,
  updateReportFilters,
  updateReportPagination,
  updateReportsTotal
} from '../../../state';

@Injectable({ providedIn: 'root' })
export class ReportStateService {
  private selectReportPagination$ = this.store.select(selectReportPagination);
  private selectReportFilters$ = this.store.select(selectReportFilters);
  currentPagination: CommonPaginationState;
  currentFilters:FiltrationStateModel;
    constructor(
    private store: Store,
    private service: GreateBeltPnReportService,
  ) {
    this.selectReportPagination$.subscribe((x) => this.currentPagination = x);
    this.selectReportFilters$.subscribe((x) => this.currentFilters = x);
  }

  getReport(eformIds: number[]) {
    return this.service
      .getReport({
        ...this.currentPagination,
        ...this.currentFilters,
        eformIds,
      })
      .pipe(
        tap((response) => {
          if (response && response.success && response.model) {
            this.store.dispatch(updateReportsTotal(response.model.total));
          }
        })
      );
  }

  updateNameFilter(nameFilter: string) {
    this.store.dispatch(updateReportFilters({...this.currentFilters, nameFilter: nameFilter,}));
  }

  onSortTable(sort: string) {
    const localPageSettings = updateTableSort(
      sort,
      this.currentPagination.sort,
      this.currentPagination.isSortDsc
    );
    this.store.dispatch(updateReportPagination({
      ...this.currentPagination,
      ...localPageSettings,
    }));
  }

  updatePagination(pagination: PaginationModel) {
    this.store.dispatch(updateReportPagination({
      ...this.currentPagination,
      pageSize: pagination.pageSize,
      offset: pagination.offset,
    }));
  }
}
