import { first, map, Observable, of } from 'rxjs';
import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Translator } from './translator';
import { LocaleManager, OnLocaleChange } from '../locale';

/**
 * a pipe that will translate and possibly interpolate any placeholders given the current locale.
 */
@Pipe({
  name: 'translate',
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy, OnLocaleChange {
  // instance data

  private translated = '';
  private lastKey = ""
  unsubscribe : () => void

  // constructor

  constructor(private i18n : Translator, localeManager: LocaleManager) {
    this.unsubscribe = localeManager.subscribe(this)
  }

  // implement PipeTransform

  /**
   * @inheritdoc
   */
  transform(key : string, options? : any) : string {
    if (key !== this.lastKey) {
      this.i18n.translate$(key, options)
        .pipe(first())
        .subscribe((translated) => {
          this.lastKey = key
          this.translated = translated;
        });
    }

    return this.translated;
  }

  onLocaleChange(locale: Intl.Locale): Observable<any> {
    this.lastKey = ""

    return of()
  }

  // implement OnDestroy

  ngOnDestroy() : void {
    this.unsubscribe()
  }
}
