import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {ActivatedRoute, Params, Route, Router} from '@angular/router';
import { saveAs } from 'file-saver';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {CaseModel, Paged, PaginationModel} from 'src/app/common/models';
import {
  CaseArchiveModalComponent,
  CaseRemoveModalComponent,
} from 'src/app/common/modules/eform-cases/components';
import { EFormService } from 'src/app/common/services';
import { AuthStateService } from 'src/app/common/store';
import { ReportCaseModel } from '../../../../models';
import { GreateBeltPnClaims } from '../../../../enums';
import { GreateBeltPnReportService } from '../../../../services';
import { ReportStateService } from '../../store';
import {MatDialog} from '@angular/material/dialog';
import {Overlay} from '@angular/cdk/overlay';
import {dialogConfigHelper} from 'src/app/common/helpers';
import {MtxGridColumn} from '@ng-matero/extensions/grid';
import {STANDARD_DATE_FORMAT} from 'src/app/common/const';
import {TranslateService} from '@ngx-translate/core';

@AutoUnsubscribe()
@Component({
  selector: 'app-report-container',
  templateUrl: './report-container.component.html',
  styleUrls: ['./report-container.component.scss'],
})
export class ReportContainerComponent implements OnInit, OnDestroy {
  @ViewChild('caseRemoveModal', { static: true })
  caseRemoveModal: CaseRemoveModalComponent;
  nameSearchSubject = new Subject();
  reportModel: Paged<ReportCaseModel> = new Paged<ReportCaseModel>();
  //tableHeaders: MtxGridColumn[];
  selectedEformIds: number[] = [];

  getReportSub$: Subscription;
  downloadEformPdf$: Subscription;
  routeSub$: Subscription;
  caseArchiveModalComponentAfterClosedSub$: Subscription;
  caseRemoveModalComponentAfterClosedSub$: Subscription;
  queryParams: Params;

  tableHeaders: MtxGridColumn[] = [
    {header: this.translateService.stream('Id'), field: 'id', sortProp: {id: 'Id'}, sortable: true, class: 'reportCaseId'},
    {
      header: this.translateService.stream('Maximo arbejdsordre nr'),
      field: 'customField1',
      sortProp: {id: 'FieldValue1'},
      sortable: true,
      class: 'reportCaseCustomField1'
    },
    {
      header: this.translateService.stream('Done at'),
      field: 'doneAtUserEditable',
      sortProp: {id: 'DoneAtUserModifiable'},
      sortable: true,
      class: 'reportCaseDoneAt',
      type: 'date',
      typeParameter: {format: STANDARD_DATE_FORMAT}
    },
    {header: this.translateService.stream('Done by'), field: 'doneBy', sortProp: {id: 'Name'}, sortable: true, class: 'reportCaseDoneBy'},
    {header: this.translateService.stream('Area'), field: 'itemName', sortProp: {id: 'ItemName'}, sortable: true, class: 'reportCaseItemName'},
    {
      header: this.translateService.stream('Status'),
      field: 'isArchived', sortProp: {id: 'IsArchived'},
      sortable: true,
      type: 'button',
      buttons: [
        {
          iif: (rowData: ReportCaseModel) => rowData.isArchived,
          icon: 'inventory',
          type: 'icon',
          class: 'reportCaseArchive',
          color: 'primary',
          tooltip: this.translateService.stream('Unarchive'),
          click: (rowData: ReportCaseModel) => this.onShowArchiveCaseModal(rowData),
        },
        {
          iif: (rowData: ReportCaseModel) => !rowData.isArchived,
          icon: 'inventory',
          type: 'icon',
          class: 'reportCaseArchive',
          color: 'warn',
          tooltip: this.translateService.stream('Archive'),
          click: (rowData: ReportCaseModel) => this.onShowArchiveCaseModal(rowData),
        },
      ]
    },
    {
      header: this.translateService.stream('Actions'),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'edit',
          color: 'accent',
          tooltip: this.translateService.stream('Edit Case'),
          click: (rowData: ReportCaseModel) => this.router.navigate(['/cases/edit/' + rowData.id + '/' + rowData.templateId], {queryParams: this.queryParams}),
        },
        {
          type: 'icon',
          icon: 'picture_as_pdf',
          color: 'accent',
          tooltip: this.translateService.stream('Download PDF'),
          click: (rowData: ReportCaseModel) => this.onDownloadPdf(rowData),
        },
        {
          color: 'warn',
          type: 'icon',
          icon: 'delete',
          tooltip: this.translateService.stream('Delete Case'),
          click: (rowData: ReportCaseModel) => this.onShowRemoveCaseModal(rowData),
        },
      ]
    },
  ];


  constructor(
    private reportService: GreateBeltPnReportService,
    public reportStateService: ReportStateService,
    public authStateService: AuthStateService,
    private eFormService: EFormService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private overlay: Overlay,
    private translateService: TranslateService,
  ) {
    this.nameSearchSubject.pipe(debounceTime(500)).subscribe((val) => {
      this.reportStateService.updateNameFilter(val.toString());
      this.getReport();
    });

    if (this.router.url.indexOf('/oresund/14-dags') > -1) {
      this.selectedEformIds = [707];
    }

    if (this.router.url.indexOf('/oresund/tr') > -1) {
      this.selectedEformIds = [449];
      this.tableHeaders = [
        {header: this.translateService.stream('Id'), field: 'id', sortProp: {id: 'Id'}, sortable: true, class: 'reportCaseId'},
        {
          header: this.translateService.stream('Sporskifte nr.'),
          field: 'customField1',
          sortProp: {id: 'FieldValue1'},
          sortable: true,
          class: 'reportCaseCustomField1'
        },
        {
          header: this.translateService.stream('Spor nr.'),
          field: 'customField2',
          sortProp: {id: 'FieldValue2'},
          sortable: true,
          class: 'reportCaseCustomField2'
        },
        {
          header: this.translateService.stream('Km fra'),
          field: 'customField3',
          sortProp: {id: 'FieldValue3'},
          sortable: true,
          class: 'reportCaseCustomField3'
        },
        {
          header: this.translateService.stream('Km til'),
          field: 'customField4',
          sortProp: {id: 'FieldValue4'},
          sortable: true,
          class: 'reportCaseCustomField4'
        },
        {
          header: this.translateService.stream('Fejl'),
          field: 'customField5',
          sortProp: {id: 'FieldValue5'},
          sortable: true,
          class: 'reportCaseCustomField5'
        },
        {
          header: this.translateService.stream('Driftmessige konsekvenser'),
          field: 'customField6',
          sortProp: {id: 'FieldValue6'},
          sortable: true,
          class: 'reportCaseCustomField6'
        },
        {header: this.translateService.stream('Area'), field: 'itemName', sortProp: {id: 'ItemName'}, sortable: true, class: 'reportCaseItemName'},
        {
          header: this.translateService.stream('Done at'),
          field: 'doneAtUserEditable',
          sortProp: {id: 'DoneAtUserModifiable'},
          sortable: true,
          class: 'reportCaseDoneAt',
          type: 'date',
          typeParameter: {format: STANDARD_DATE_FORMAT}
        },
        {header: this.translateService.stream('Done by'), field: 'doneBy', sortProp: {id: 'Name'}, sortable: true, class: 'reportCaseDoneBy'},
        {
          header: this.translateService.stream('Status'),
          field: 'isArchived', sortProp: {id: 'IsArchived'},
          sortable: true,
          type: 'button',
          buttons: [
            {
              iif: (rowData: ReportCaseModel) => rowData.isArchived,
              icon: 'inventory',
              type: 'icon',
              class: 'reportCaseUnarchive',
              color: 'primary',
              tooltip: this.translateService.stream('Unarchive'),
              click: (rowData: ReportCaseModel) => this.onShowArchiveCaseModal(rowData),
            },
            {
              iif: (rowData: ReportCaseModel) => !rowData.isArchived,
              icon: 'inventory',
              type: 'icon',
              class: 'reportCaseArchive',
              color: 'warn',
              tooltip: this.translateService.stream('Archive'),
              click: (rowData: ReportCaseModel) => this.onShowArchiveCaseModal(rowData),
            },
          ]
        },
        {
          header: this.translateService.stream('Actions'),
          field: 'actions',
          type: 'button',
          buttons: [
            {
              type: 'icon',
              icon: 'edit',
              color: 'accent',
              tooltip: this.translateService.stream('Edit Case'),
              click: (rowData: ReportCaseModel) => this.router.navigate(['/cases/edit/' + rowData.id + '/' + rowData.templateId], {queryParams: this.queryParams}),
            },
            {
              type: 'icon',
              icon: 'picture_as_pdf',
              color: 'accent',
              tooltip: this.translateService.stream('Download PDF'),
              click: (rowData: ReportCaseModel) => this.onDownloadPdf(rowData),
            },
            {
              color: 'warn',
              type: 'icon',
              icon: 'delete',
              tooltip: this.translateService.stream('Delete Case'),
              click: (rowData: ReportCaseModel) => this.onShowRemoveCaseModal(rowData),
            },
          ]
        },
      ];
    }

    if (this.router.url.indexOf('/oresund/oesaekcsltf') > -1) {
      this.selectedEformIds = [451];
    }

    if (this.router.url.indexOf('/oresund/oesse') > -1) {
      this.selectedEformIds = [453, 462, 506, 620];
    }

    if (this.router.url.indexOf('/storebaelt/2-mdr') > -1) {
      this.selectedEformIds = [23];
    }

    if (this.router.url.indexOf('/storebaelt/tr') > -1) {
      this.selectedEformIds = [36];
      this.tableHeaders = [
        {header: this.translateService.stream('Id'), field: 'id', sortProp: {id: 'Id'}, sortable: true, class: 'reportCaseId'},
        {
          header: this.translateService.stream('Sporskifte nr.'),
          field: 'customField1',
          sortProp: {id: 'FieldValue1'},
          sortable: true,
          class: 'reportCaseCustomField1'
        },
        {
          header: this.translateService.stream('Spor nr.'),
          field: 'customField2',
          sortProp: {id: 'FieldValue2'},
          sortable: true,
          class: 'reportCaseCustomField2'
        },
        {
          header: this.translateService.stream('Km fra'),
          field: 'customField3',
          sortProp: {id: 'FieldValue3'},
          sortable: true,
          class: 'reportCaseCustomField3'
        },
        {
          header: this.translateService.stream('Km til'),
          field: 'customField4',
          sortProp: {id: 'FieldValue4'},
          sortable: true,
          class: 'reportCaseCustomField4'
        },
        {
          header: this.translateService.stream('Fejl'),
          field: 'customField5',
          sortProp: {id: 'FieldValue5'},
          sortable: true,
          class: 'reportCaseCustomField5'
        },
        {
          header: this.translateService.stream('Driftmessige konsekvenser'),
          field: 'customField6',
          sortProp: {id: 'FieldValue6'},
          sortable: true,
          class: 'reportCaseCustomField6'
        },
        {header: this.translateService.stream('Area'), field: 'itemName', sortProp: {id: 'ItemName'}, sortable: true, class: 'reportCaseItemName'},
        {
          header: this.translateService.stream('Done at'),
          field: 'doneAtUserEditable',
          sortProp: {id: 'DoneAtUserModifiable'},
          sortable: true,
          class: 'reportCaseDoneAt',
          type: 'date',
          typeParameter: {format: STANDARD_DATE_FORMAT}
        },
        {header: this.translateService.stream('Done by'), field: 'doneBy', sortProp: {id: 'Name'}, sortable: true, class: 'reportCaseDoneBy'},
        {
          header: this.translateService.stream('Status'),
          field: 'isArchived', sortProp: {id: 'IsArchived'},
          sortable: true,
          type: 'button',
          buttons: [
            {
              iif: (rowData: ReportCaseModel) => rowData.isArchived,
              icon: 'inventory',
              type: 'icon',
              class: 'reportCaseUnarchive',
              color: 'primary',
              tooltip: this.translateService.stream('Unarchive'),
              click: (rowData: ReportCaseModel) => this.onShowArchiveCaseModal(rowData),
            },
            {
              iif: (rowData: ReportCaseModel) => !rowData.isArchived,
              icon: 'inventory',
              type: 'icon',
              class: 'reportCaseArchive',
              color: 'warn',
              tooltip: this.translateService.stream('Archive'),
              click: (rowData: ReportCaseModel) => this.onShowArchiveCaseModal(rowData),
            },
          ]
        },
        {
          header: this.translateService.stream('Actions'),
          field: 'actions',
          type: 'button',
          buttons: [
            {
              type: 'icon',
              icon: 'edit',
              color: 'accent',
              tooltip: this.translateService.stream('Edit Case'),
              click: (rowData: ReportCaseModel) => this.router.navigate(['/cases/edit/' + rowData.id + '/' + rowData.templateId], {queryParams: this.queryParams}),
            },
            {
              type: 'icon',
              icon: 'picture_as_pdf',
              color: 'accent',
              tooltip: this.translateService.stream('Download PDF'),
              click: (rowData: ReportCaseModel) => this.onDownloadPdf(rowData),
            },
            {
              color: 'warn',
              type: 'icon',
              icon: 'delete',
              tooltip: this.translateService.stream('Delete Case'),
              click: (rowData: ReportCaseModel) => this.onShowRemoveCaseModal(rowData),
            },
          ]
        },
      ];
    }

    if (this.router.url.indexOf('/storebaelt/14-dags') > -1) {
      this.selectedEformIds = [11];
    }

    if (this.router.url.indexOf('/storebaelt/saekcsltf') > -1) {
      this.selectedEformIds = [38];
    }

    if (this.router.url.indexOf('/storebaelt/sse') > -1) {
      this.selectedEformIds = [40, 147, 191, 305, 412];
    }

    this.getReport();
  }

  ngOnInit(
    ) {this.queryParams = { reverseRoute: this.router.url };}

  getReport() {
    this.getReportSub$ = this.reportStateService
      .getReport(this.selectedEformIds)
      .subscribe((data) => {
        if (data && data.success) {
          this.reportModel = data.model;
        }
      });
  }

  ngOnDestroy(): void {}
  //
  // onPageSizeChanged(newPageSize: number) {
  //   this.reportStateService.updatePageSize(newPageSize);
  //   this.getReport();
  // }
  //
  // sortTable(sort: string) {
  //   this.reportStateService.onSortTable(sort);
  //   this.getReport();
  // }
  //
  // changePage(newPage: any) {
  //   this.reportStateService.changePage(newPage);
  //   this.getReport();
  // }

  onNameFilterChanged(name: string) {
    this.nameSearchSubject.next(name);
  }

  showRemoveCaseModal(model: ReportCaseModel) {
    this.caseRemoveModalComponentAfterClosedSub$ = this.dialog.open(CaseRemoveModalComponent,
      {
        ...dialogConfigHelper(this.overlay, {
          caseModel: new CaseModel({
            id: model.id,
            doneAt: model.doneAtUserEditable,
            workerName: model.doneBy,
          }),
          templateId: model.templateId
        }), minWidth: 600})
      .afterClosed()
      .subscribe(data => data ? this.getReport() : void 0);
  }

  showArchiveCaseModal(model: ReportCaseModel) {
    this.caseArchiveModalComponentAfterClosedSub$= this.dialog.open(CaseArchiveModalComponent, dialogConfigHelper(this.overlay, {
      id: model.id,
      doneAt: model.doneAtUserEditable,
      templateId: model.templateId,
      workerName: model.doneBy,
      isArchived: model.isArchived,
    })).afterClosed().subscribe(x => x ? this.getReport() : void 0);
  }

  onDownloadPdf(model: ReportCaseModel) {
    this.downloadEformPdf$ = this.reportService
      .downloadEformPDF(model.templateId, model.id, model.itemId)
      .subscribe((data) => {
        const blob = new Blob([data]);
        saveAs(blob, `template_${model.templateId}.pdf`);
      });
  }


  onPaginationChanged(paginationModel: PaginationModel) {
    this.reportStateService.updatePagination(paginationModel);
    this.getReport();
  }


  onShowRemoveCaseModal(planning: ReportCaseModel) {
    this.showRemoveCaseModal(planning);
  }

  onShowArchiveCaseModal(reportCaseModel: ReportCaseModel) {
    this.showArchiveCaseModal(reportCaseModel);
  }

  // onDownloadPdf(model: ReportCaseModel) {
  //   this.downloadPdf.emit(model);
  // }
}
