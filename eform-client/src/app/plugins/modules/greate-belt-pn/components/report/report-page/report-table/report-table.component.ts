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
import {Store} from '@ngrx/store';
import {
  selectReportPaginationIsSortDsc,
  selectReportPaginationSort
} from "src/app/plugins/modules/greate-belt-pn/state/report/report.selector";

@Component({
  selector: 'app-report-table',
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportTableComponent implements OnInit {
  @Input() reportModel: Paged<ReportCaseModel> = new Paged<ReportCaseModel>();
  @Input() tableHeaders: MtxGridColumn[];
  @Input() paginationTemplate!: TemplateRef<any>;
  @Input() toolbarTemplate!: TemplateRef<any>;
  @Output() showArchiveCaseModal: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();
  @Output() showRemoveCaseModal: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();
  @Output() downloadPdf: EventEmitter<ReportCaseModel> = new EventEmitter<ReportCaseModel>();
  @Output() sortChange: EventEmitter<void> = new EventEmitter<void>();

  get greateBeltPnClaims() {
    return GreateBeltPnClaims;
  }

  public selectReportPaginationIsSortDsc$ = this.store.select(selectReportPaginationIsSortDsc);
  public selectReportPaginationSort$ = this.store.select(selectReportPaginationSort);

  constructor(
    private store: Store,
    private router: Router,
    public reportStateService: ReportStateService,
    private translateService: TranslateService,
  ) {}

  ngOnInit(): void {
  }

  sortTable(sort: Sort) {
    this.reportStateService.onSortTable(sort.active);
    this.sortChange.emit();
  }
}
