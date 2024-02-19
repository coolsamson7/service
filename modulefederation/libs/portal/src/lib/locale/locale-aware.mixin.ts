import { Observable, of } from "rxjs";
import { AbstractFeature } from "../feature";
import { LocaleManager } from "./locale.manager";
import { registerMixins } from "../common/lang/mixin";
import { GConstructor } from "../common/lang/constructor.type";

export interface OnLocaleChange {
    /**
     * called whenever the current locale changes
     * @param locale the new locale
     */
    onLocaleChange(locale : Intl.Locale) : Observable<any>;
}

export function WithOnLocaleChange<T extends GConstructor<AbstractFeature>>(base: T) :GConstructor<OnLocaleChange> &  T  {
    return registerMixins(class extends base implements OnLocaleChange {
      // constructor

      constructor(...args: any[]) {
        super(...args);

        const unsubscribe = this.injector.get(LocaleManager).subscribe(this)
        this.onDestroy(() => unsubscribe())
      }

      // implement OnLocaleChange

      onLocaleChange(_ : Intl.Locale) : Observable<any> {
          return of()
      }
    }, WithOnLocaleChange)
  }
