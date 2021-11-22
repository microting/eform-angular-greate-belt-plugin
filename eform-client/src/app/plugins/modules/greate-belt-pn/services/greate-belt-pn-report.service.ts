import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationDataResult, Paged } from 'src/app/common/models';
import { ApiBaseService } from 'src/app/common/services';
import { ReportCaseModel, ReportRequestModel } from '../models';

export let GreateBeltPnPropertiesMethods = {
  ReportIndex: 'api/greate-belt-pn/report',
};

@Injectable({
  providedIn: 'root',
})
export class GreateBeltPnReportService {
  constructor(private apiBaseService: ApiBaseService) {}

  getReport(
    model: ReportRequestModel
  ): Observable<OperationDataResult<Paged<ReportCaseModel>>> {
    return this.apiBaseService.post(
      GreateBeltPnPropertiesMethods.ReportIndex,
      model
    );
  }
}
