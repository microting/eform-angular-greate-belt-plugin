import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output, TemplateRef,
} from '@angular/core';
import { Paged, } from 'src/app/common/models';
import { GreateBeltPnClaims } from '../../../../enums';
import { ReportStateService } from '../../store';
import { ReportCaseModel } from '../../../../models';
import { STANDARD_DATE_FORMAT } from 'src/app/common/const';
import {Params, Router } from '@angular/router';
import {Sort} from '@angular/material/sort';
import {MtxGridColumn} from '@ng-matero/extensions/grid';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-report-table',
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTableComponent implements OnInit {
  @Input() reportModel: Paged<ReportCaseModel> = new Paged<ReportCaseModel>();
  @Input() paginationTemplate!: TemplateRef<any>;
  @Input() toolbarTemplate!: TemplateRef<any>;
  @Output() showArchiveCaseModal: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();
  @Output() showRemoveCaseModal: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();
  @Output() downloadPdf: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();
  @Output() sortChange: EventEmitter<void> = new EventEmitter<void>();
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

  get greateBeltPnClaims() {
    return GreateBeltPnClaims;
  }

  constructor(
    private router: Router,
    public reportStateService: ReportStateService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
    this.queryParams = { reverseRoute: this.router.url };
  }

  onShowRemoveCaseModal(planning: ReportCaseModel) {
    this.showRemoveCaseModal.emit(planning);
  }

  onShowArchiveCaseModal(reportCaseModel: ReportCaseModel) {
    this.showArchiveCaseModal.emit(reportCaseModel);
  }

  onDownloadPdf(model: ReportCaseModel) {
    this.downloadPdf.emit(model);
  }

  sortTable(sort: Sort) {
    this.reportStateService.onSortTable(sort.active);
    this.sortChange.emit();
  }
}
