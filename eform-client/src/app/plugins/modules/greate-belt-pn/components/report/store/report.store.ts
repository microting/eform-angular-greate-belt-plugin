import { Injectable } from '@angular/core';
import { persistState, Store, StoreConfig } from '@datorama/akita';
import {
  FiltrationStateModel,
  CommonPaginationState,
} from 'src/app/common/models';

export interface ReportState {
  pagination: CommonPaginationState;
  filters: FiltrationStateModel;
  totalReportCases: number;
}

function createInitialState(): ReportState {
  return <ReportState>{
    pagination: {
      pageSize: 10,
      sort: 'Id',
      isSortDsc: false,
      offset: 0,
    },
    filters: {
      nameFilter: '',
      tagIds: [],
    },
    totalReportCases: 0,
  };
}

const reportPersistStorage = persistState({
  include: ['report'],
  key: 'greateBeltPn',
  preStorageUpdate(storeName, state: ReportState) {
    return {
      pagination: state.pagination,
      filters: state.filters,
    };
  },
});

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'report', resettable: true })
export class ReportStore extends Store<ReportState> {
  constructor() {
    super(createInitialState());
  }
}

export const reportPersistProvider = {
  provide: 'persistStorage',
  useValue: reportPersistStorage,
  multi: true,
};
