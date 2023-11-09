import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {EformCasesModule} from 'src/app/common/modules/eform-cases/eform-cases.module';
import {EformSharedModule} from 'src/app/common/modules/eform-shared/eform-shared.module';
import {ReportContainerComponent, ReportTableComponent} from './components';
import {GreateBeltPnRouting} from './greate-belt-pn.routing.module';
import {GreateBeltPnLayoutComponent} from './layouts';
import {GreateBeltPnReportService} from './services';
import {MtxGridModule} from '@ng-matero/extensions/grid';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import * as reportReducer from './state/report/report.reducer';
import {StoreModule} from '@ngrx/store';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    EformSharedModule,
    RouterModule,
    GreateBeltPnRouting,
    EformCasesModule,
    MtxGridModule,
    MatFormFieldModule,
    MatInputModule,
    StoreModule.forFeature('greateBeltPn', {
      reportState: reportReducer.reportReducer,
    })
  ],
  declarations: [
    GreateBeltPnLayoutComponent,
    ReportContainerComponent,
    ReportTableComponent,
  ],
  providers: [GreateBeltPnReportService],
})
export class GreateBeltPnModule {
}
