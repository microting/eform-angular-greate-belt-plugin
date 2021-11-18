import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { EformCasesModule } from 'src/app/common/modules/eform-cases/eform-cases.module';
import { EformSharedModule } from 'src/app/common/modules/eform-shared/eform-shared.module';
import { GreateBeltPnRouting } from './greate-belt-pn.routing.module';
import { GreateBeltPnLayoutComponent } from './layouts';
import {
  GreateBeltPnReportService,
} from './services';
import { greateBeltStoreProviders } from './store-providers.config';

@NgModule({
  imports: [
    CommonModule,
    MDBBootstrapModule,
    TranslateModule,
    FormsModule,
    NgSelectModule,
    EformSharedModule,
    FontAwesomeModule,
    RouterModule,
    GreateBeltPnRouting,
    ReactiveFormsModule,
    EformCasesModule,
  ],
  declarations: [
    GreateBeltPnLayoutComponent,
  ],
  providers: [
    GreateBeltPnReportService,
    ...greateBeltStoreProviders,
  ]
})
export class GreateBeltPnModule {}
