import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, PermissionGuard } from 'src/app/common/guards';
import { ReportContainerComponent } from './components';
import { GreateBeltPnClaims } from './enums';
import { GreateBeltPnLayoutComponent } from './layouts';

export const routes: Routes = [
  {
    path: '',
    component: GreateBeltPnLayoutComponent,
    // canActivate: [PermissionGuard],
    // data: {
    //   requiredPermission:
    //     BackendConfigurationPnClaims.accessBackendConfigurationPlugin,
    // },
    children: [
      {
        path: 'greate-belt/report',
        // canActivate: [PermissionGuard],
        // data: {
        //   requiredPermission: BackendConfigurationPnClaims.getProperties,
        // },
        component: ReportContainerComponent,
      },
      {
        path: 'oresund/report',
        // canActivate: [PermissionGuard],
        // data: {
        //   requiredPermission: BackendConfigurationPnClaims.getProperties,
        // },
        component: ReportContainerComponent,
      }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GreateBeltPnRouting {}
