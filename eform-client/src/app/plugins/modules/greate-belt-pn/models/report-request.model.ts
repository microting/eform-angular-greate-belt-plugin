import {PagedEntityRequest} from 'src/app/common/models';

export class ReportRequestModel extends PagedEntityRequest {
  nameFilter: string;
  eformIds: number[] = [];

  constructor() {
    super();
    this.nameFilter = '';
  }
}
