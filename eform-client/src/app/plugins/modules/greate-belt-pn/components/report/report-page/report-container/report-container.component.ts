import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CaseModel, Paged } from 'src/app/common/models';
import {
  CaseArchiveModalComponent,
  CaseRemoveModalComponent,
} from 'src/app/common/modules/eform-cases/components';
import { AuthStateService } from 'src/app/common/store';
import { ReportCaseModel } from 'src/app/plugins/modules/greate-belt-pn/models';
import { GreateBeltPnClaims } from '../../../../enums';
import { GreateBeltPnReportService } from '../../../../services';
import { ReportStateService } from '../../store';

@AutoUnsubscribe()
@Component({
  selector: 'app-report-container',
  templateUrl: './report-container.component.html',
  styleUrls: ['./report-container.component.scss'],
})
export class ReportContainerComponent implements OnInit, OnDestroy {
  @ViewChild('caseRemoveModal', { static: true })
  caseRemoveModal: CaseRemoveModalComponent;
  @ViewChild('caseArchiveModal', { static: true })
  caseArchiveModal: CaseArchiveModalComponent;
  nameSearchSubject = new Subject();
  reportModel: Paged<ReportCaseModel> = new Paged<ReportCaseModel>();

  getReportSub$: Subscription;

  constructor(
    private reportService: GreateBeltPnReportService,
    public reportStateService: ReportStateService,
    public authStateService: AuthStateService
  ) {
    this.nameSearchSubject.pipe(debounceTime(500)).subscribe((val) => {
      this.reportStateService.updateNameFilter(val.toString());
      this.getReport();
    });
  }

  get greateBeltPnClaims() {
    return GreateBeltPnClaims;
  }

  ngOnInit() {
    this.getReport();
  }

  getReport() {
    this.getReportSub$ = this.reportStateService
      .getReport([1, 2])
      .subscribe((data) => {
        this.reportModel = data.model;
      });
  }

  ngOnDestroy(): void {}

  onPageSizeChanged(newPageSize: number) {
    this.reportStateService.updatePageSize(newPageSize);
    this.getReport();
  }

  sortTable(sort: string) {
    this.reportStateService.onSortTable(sort);
    this.getReport();
  }

  changePage(newPage: any) {
    this.reportStateService.changePage(newPage);
    this.getReport();
  }

  onNameFilterChanged(name: string) {
    this.nameSearchSubject.next(name);
  }

  showRemoveCaseModal(model: ReportCaseModel) {
    this.caseRemoveModal.show(
      new CaseModel({
        id: model.id,
        doneAt: model.doneAtUserEditable,
        workerName: model.doneBy,
      }),
      1
    );
  }

  showArchiveCaseModal(model: ReportCaseModel) {
    this.caseArchiveModal.show({
      id: model.id,
      doneAt: model.doneAtUserEditable,
      templateId: 1,
      workerName: model.doneBy,
    });
  }
}
