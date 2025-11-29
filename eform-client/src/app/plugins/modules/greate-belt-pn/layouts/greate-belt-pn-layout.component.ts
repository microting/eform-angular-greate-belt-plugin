import {AfterContentInit, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {translates} from './../i18n/translates';
import {AuthStateService} from 'src/app/common/store';
import {Subscription, tap} from 'rxjs';
import {LocaleService} from 'src/app/common/services';
import {selectCurrentUserLocale} from 'src/app/state';
import {Store} from '@ngrx/store';
import {filter} from 'rxjs/operators';

@Component({
    selector: 'app-greate-belt-pn-layout',
    template: `
    <router-outlet></router-outlet>`,
    standalone: false
})
export class GreateBeltPnLayoutComponent
  implements AfterContentInit, OnInit, OnDestroy {
  private store = inject(Store);
  private localeService = inject(LocaleService);
  private translateService = inject(TranslateService);
  private authStateService = inject(AuthStateService);

  currentUserLocaleAsyncSub$: Subscription;
  private selectCurrentUserLocale$ = this.store.select(selectCurrentUserLocale);

  ngOnInit(): void {
  }

  ngAfterContentInit() {
    this.currentUserLocaleAsyncSub$ = this.selectCurrentUserLocale$.subscribe((locale) => {
      const i18n = translates[locale];
      this.translateService.setTranslation(locale, i18n, true);
    });
  }

  ngOnDestroy(): void {
    this.currentUserLocaleAsyncSub$.unsubscribe();
  }
}
