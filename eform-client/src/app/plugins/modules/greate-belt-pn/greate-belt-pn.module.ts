import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {GreateBeltPnRouting} from './greate-belt-pn.routing.module';
import {GreateBeltPnReportService} from './services';
import * as reportReducer from './state/report/report.reducer';

@NgModule({
  imports: [
    GreateBeltPnRouting,
    StoreModule.forFeature('greateBeltPn', {
      reportState: reportReducer.reportReducer,
    }),
  ],
  providers: [GreateBeltPnReportService],
})
export class GreateBeltPnModule {
}
