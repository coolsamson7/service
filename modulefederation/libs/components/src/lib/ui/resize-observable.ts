import { Observable } from "rxjs";
import { NgZone } from "@angular/core";

/**
 * this is an observable that will emit when size changes are detected.
 */
export class ResizeObservable extends Observable<ResizeObserverEntry[]> {
  // constructor

  constructor(elem: HTMLElement, zone: NgZone) {
    super(subscriber => {
      const observer = new ResizeObserver(entries => {
        zone.run(() => subscriber.next(entries))
      });

      observer.observe(elem);  // Observe one or multiple elements

      // return unsubscribe function

      return function unsubscribe() {
        observer.unobserve(elem);
        observer.disconnect();
      }
    });
  }
}
