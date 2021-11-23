import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Paged, TableHeaderElementModel } from 'src/app/common/models';
import { GreateBeltPnClaims } from '../../../../enums';
import { ReportCaseModel } from '../../../../models';

@Component({
  selector: 'app-report-table',
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTableComponent implements OnInit {
  @Input() reportModel: Paged<ReportCaseModel> = new Paged<ReportCaseModel>();
  @Output()
  showArchiveCaseModal: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();
  @Output()
  showRemoveCaseModal: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();
  @Output()
  downloadPdf: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();

  tableHeaders: TableHeaderElementModel[] = [
    { name: 'Id', elementId: 'idTableHeader', sortable: false },
    {
      name: 'Maximo arbejdsordre nr',
      elementId: 'customField1TableHeader',
      sortable: false,
    },
    {
      name: 'Done at',
      elementId: 'doneAtTableHeader',
      sortable: false,
    },
    {
      name: 'Done by',
      elementId: 'doneByTableHeader',
      sortable: false,
    },
    { name: 'Area', elementId: 'itemPlanningNameTableHeader', sortable: false },
    { name: 'Status', elementId: 'statusTableHeader', sortable: false },
    { name: 'Actions', elementId: '', sortable: false },
  ];

  get greateBeltPnClaims() {
    return GreateBeltPnClaims;
  }

  constructor() {}

  ngOnInit(): void {}

  onShowRemoveCaseModal(planning: ReportCaseModel) {
    this.showRemoveCaseModal.emit(planning);
  }

  onShowArchiveCaseModal(planning: ReportCaseModel) {
    this.showArchiveCaseModal.emit(planning);
  }

  onDownloadPdf(model: ReportCaseModel) {
    this.downloadPdf.emit(model);
  }
}
