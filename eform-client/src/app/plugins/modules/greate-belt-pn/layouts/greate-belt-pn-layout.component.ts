import {AfterContentInit, Component, OnDestroy, OnInit} from '@angular/core';
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
})
export class GreateBeltPnLayoutComponent
  implements AfterContentInit, OnInit, OnDestroy {
  currentUserLocaleAsyncSub$: Subscription;
  getTranslationsSub$: Subscription;
  private selectCurrentUserLocale$ = this.store.select(selectCurrentUserLocale);
  constructor(
    private store: Store,
    private localeService: LocaleService,
    private translateService: TranslateService,
    private authStateService: AuthStateService
  ) {
  }

  ngOnInit(): void {
  }

  ngAfterContentInit() {
    this.currentUserLocaleAsyncSub$ = this.selectCurrentUserLocale$.subscribe((locale) => {
      this.getTranslationsSub$ = this.translateService.getTranslation(locale).pipe(
        filter(x => !!x),
        tap(() => {
          const i18n = translates[locale];
          this.translateService.setTranslation(locale, i18n, true);
        })
      ).subscribe()
    });
  }

  ngOnDestroy(): void {
    this.getTranslationsSub$.unsubscribe();
    this.currentUserLocaleAsyncSub$.unsubscribe();
  }
}
