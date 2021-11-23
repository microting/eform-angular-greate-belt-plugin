import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportContainerComponent } from './components';
import { GreateBeltPnLayoutComponent } from './layouts';

export const routes: Routes = [
  {
    path: '',
    component: GreateBeltPnLayoutComponent,
    children: [
      {
        path: 'report/storebaelt/14-dags',
        component: ReportContainerComponent,
      },
      {
        path: 'report/oresund/14-dags',
        component: ReportContainerComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GreateBeltPnRouting {}
