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
import { applicationLanguages } from 'src/app/common/const';

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
  showDeleteCaseModal: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();

  tableHeaders: TableHeaderElementModel[] = [
    { name: 'Id', elementId: 'idTableHeader', sortable: false },
    { name: 'Name', elementId: 'nameTableHeader', sortable: false },
    {
      name: 'CHR Number',
      elementId: 'chrNumberTableHeader',
      sortable: false,
    },
    {
      name: 'Address',
      elementId: 'addressTableHeader',
      sortable: false,
    },
    { name: 'Languages', elementId: 'languagesTableHeader', sortable: false },
    { name: 'Actions', elementId: '', sortable: false },
  ];

  get backendConfigurationPnClaims() {
    return GreateBeltPnClaims;
  }

  constructor() {}

  ngOnInit(): void {}

  onShowDeletePropertyModal(planning: ReportCaseModel) {
    this.showDeleteCaseModal.emit(planning);
  }

  onShowEditPropertyModal(planning: ReportCaseModel) {
    this.showArchiveCaseModal.emit(planning);
  }
}
