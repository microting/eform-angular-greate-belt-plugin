import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OperationDataResult, Paged } from 'src/app/common/models';
import { ApiBaseService } from 'src/app/common/services';
import { ReportCaseModel, ReportRequestModel } from '../models';

export let GreateBeltPnPropertiesMethods = {
  ReportIndex: 'api/greate-belt-pn/report',
  DownloadPDF: 'api/greate-belt-pn/report',
};

@Injectable({
  providedIn: 'root',
})
export class GreateBeltPnReportService {
  private apiBaseService = inject(ApiBaseService);

  getReport(
    model: ReportRequestModel
  ): Observable<OperationDataResult<Paged<ReportCaseModel>>> {
    return this.apiBaseService.post(
      GreateBeltPnPropertiesMethods.ReportIndex,
      model
    );
  }

  downloadEformPDF(
    templateId: number,
    caseId: number,
    itemId: number
  ): Observable<any> {
    return this.apiBaseService.getBlobData(
      GreateBeltPnPropertiesMethods.ReportIndex +
      '/' +
      templateId +
      '/?caseId=' +
      caseId +
      '&itemId=' +
      itemId +
      '&fileType=pdf'
    );
  }
}
